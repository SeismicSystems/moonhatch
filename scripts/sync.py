import requests
import time
from typing import List, Dict, Optional, Tuple
from concurrent.futures import ThreadPoolExecutor, as_completed

MAX_CONCURRENT_REQUESTS = 5  # Start low to avoid overwhelming DB
BATCH_SIZE = 100  # Process in batches with pauses
BATCH_PAUSE = 2.0  # Seconds to pause between batches
USE_PARALLEL = True  # Set to False for sequential processing

_API_URL = "https://hatch.vegas/api"

def _get_coins_url(limit: Optional[int] = None, max_id: Optional[int] = None) -> str:
    path = f"{_API_URL}/coins"

    queries = []
    if limit:
        queries.append(f"limit={limit}")
    if max_id:
        queries.append(f"maxId={max_id}")

    if not queries:
        return path

    query = "&".join(queries)
    return f'{path}?{query}'


def _load_coins(limit: Optional[int] = None, max_id: Optional[int] = None) -> List[Dict]:
    url = _get_coins_url(limit, max_id)
    resp = requests.get(url)
    resp.raise_for_status()
    return resp.json()

def _load_coins_dict(limit: Optional[int] = None, max_id: Optional[int] = None) -> Dict[int, Dict]:
    return {c['id']: c for c in _load_coins(limit=limit, max_id=max_id)}


def load_all_coins(limit: int = 20_000) -> List[Dict]:
    coins_by_id = _load_coins_dict(limit)
    if len(coins_by_id) < limit:
        return list(coins_by_id.values())

    min_fetched_id = min(coins_by_id)
    while max(min_fetched_id, 0) != 0:
        print(f"Making request with {limit=} max_id={min_fetched_id-1}")
        latest_coins = _load_coins_dict(limit, max_id=min_fetched_id - 1)
        coins_by_id.update(latest_coins)
        if not latest_coins:
            return list(coins_by_id.values())
        min_fetched_id = min(min_fetched_id, min(latest_coins))
    return list(coins_by_id.values())


def _post(path: str, coin_id: int) -> requests.Response:
    resp = requests.post(url=f"{_API_URL}/coin/{coin_id}/{path}")
    resp.raise_for_status()
    return resp

def sync_coin(coin_id: int) -> requests.Response:
    return _post("sync", coin_id)

def deploy_coin(coin_id: int) -> requests.Response:
    return _post("deploy", coin_id)

def _get_coin(coin_id: int) -> Dict:
    resp = requests.get(url=f"{_API_URL}/coin/{coin_id}")
    resp.raise_for_status()
    return resp.json()


def sync_and_deploy_all() -> Tuple[int, int, int]:
    overall_start_time = time.time()
    
    # Phase 1: Load all coins initially
    print("Phase 1: Loading all coins...")
    all_coins = sorted(load_all_coins(), key=lambda k: k['id'], reverse=True)
    coins_to_process = [coin for coin in all_coins if coin.get('deployedPool') is None]
    n_coins = len(coins_to_process)
    n_total = len(all_coins)
    print(f"Loaded {n_total} total coins, {n_coins} to process (skipping {n_total - n_coins} already deployed)")
    
    verified = 0
    deployed = 0
    
    # Phase 2: Verify all coins (sync only)
    print(f"\nPhase 2: Verifying all {n_coins} coins...")
    start_time = time.time()
    
    def verify_single_coin(coin: Dict) -> bool:
        coin_id = coin["id"]
        try:
            sync_coin(coin_id)
            was_unverified = not coin['verified']
            return was_unverified
        except Exception as e:
            return False
    
    if USE_PARALLEL:
        completed = 0
        for batch_start in range(0, n_coins, BATCH_SIZE):
            batch_end = min(batch_start + BATCH_SIZE, n_coins)
            batch = coins_to_process[batch_start:batch_end]
            
            print(f"Verifying batch {batch_start//BATCH_SIZE + 1}: coins {batch_start+1}-{batch_end}")
            
            with ThreadPoolExecutor(max_workers=MAX_CONCURRENT_REQUESTS) as executor:
                future_to_coin = {executor.submit(verify_single_coin, coin): coin for coin in batch}
                
                for future in as_completed(future_to_coin):
                    was_unverified = future.result()
                    if was_unverified:
                        verified += 1
                    completed += 1
            
            if batch_end < n_coins:
                print(f"Verification batch complete. Pausing {BATCH_PAUSE}s...")
                time.sleep(BATCH_PAUSE)
    else:
        for i, coin in enumerate(coins_to_process):
            was_unverified = verify_single_coin(coin)
            if was_unverified:
                verified += 1
    
    verify_time = time.time() - start_time
    print(f"Phase 2 complete: Verified {verified} coins in {verify_time:.1f}s")
    
    # Phase 3: Refetch all coins
    print(f"\nPhase 3: Refetching all coins...")
    start_time = time.time()
    all_coins = sorted(load_all_coins(), key=lambda k: k['id'], reverse=True)
    refetch_time = time.time() - start_time  
    print(f"Phase 3 complete: Refetched {len(all_coins)} coins in {refetch_time:.1f}s")
    
    # Phase 4: Deploy coins that need deploying
    print(f"\nPhase 4: Deploying coins that need deployment...")
    start_time = time.time()
    
    # Get fresh list of coins that still need deployment after refetch
    coins_to_deploy = [coin for coin in all_coins if coin.get('deployedPool') is None]
    n_deploy = len(coins_to_deploy)
    print(f"Found {n_deploy} coins that need deployment")
    
    def deploy_single_coin(coin: Dict) -> bool:
        coin_id = coin["id"]
        try:
            # Check if deployment is needed by syncing first
            sync_response = sync_coin(coin_id)
            response_text = sync_response.text
            needs_deploy = "PairNotFound" in response_text
            
            if needs_deploy:
                deploy_coin(coin_id)
                print(f"Deployed coin {coin_id}")
                return True
            return False
        except Exception as e:
            return False
    
    if USE_PARALLEL:
        completed = 0
        for batch_start in range(0, n_deploy, BATCH_SIZE):
            batch_end = min(batch_start + BATCH_SIZE, n_deploy)
            batch = coins_to_deploy[batch_start:batch_end]
            
            print(f"Deploying batch {batch_start//BATCH_SIZE + 1}: coins {batch_start+1}-{batch_end}")
            
            with ThreadPoolExecutor(max_workers=MAX_CONCURRENT_REQUESTS) as executor:
                future_to_coin = {executor.submit(deploy_single_coin, coin): coin for coin in batch}
                
                for future in as_completed(future_to_coin):
                    deploy_success = future.result()
                    if deploy_success:
                        deployed += 1
                    completed += 1
            
            if batch_end < n_deploy:
                print(f"Deployment batch complete. Pausing {BATCH_PAUSE}s...")
                time.sleep(BATCH_PAUSE)
    else:
        for coin in coins_to_deploy:
            deploy_success = deploy_single_coin(coin)
            if deploy_success:
                deployed += 1
    
    deploy_time = time.time() - start_time
    total_time = time.time() - overall_start_time
    
    print(f"Phase 4 complete: Deployed {deployed} coins in {deploy_time:.1f}s")
    print(f"\nALL PHASES COMPLETE: {total_time:.1f}s total | Verified: {verified}, Deployed: {deployed}")
    
    return verified, deployed, n_coins

# Legacy function - now handled in sync_and_deploy_all
def deploy_missing() -> int:
    print("Note: deploy_missing is now integrated into sync_and_deploy_all")
    verified, deployed, n_coins = sync_and_deploy_all()
    return deployed

# Keep old function for compatibility
def sync_all() -> Tuple[int, int]:
    verified, deployed, n_coins = sync_and_deploy_all()
    return verified, n_coins

def main():
    print("Syncing and deploying coins...")
    verified, deployed, total_coins = sync_and_deploy_all()
    print(f"COMPLETE: verified {verified} coins, deployed {deployed} coins out of {total_coins} total")


if __name__ == "__main__":
    main()
