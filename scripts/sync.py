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
    all_coins = sorted(load_all_coins(), key=lambda k: k['id'], reverse=True)
    # Only process coins that don't already have a deployedPool
    coins_to_process = [coin for coin in all_coins if coin.get('deployedPool') is None]
    n_coins = len(coins_to_process)
    n_total = len(all_coins)
    verified = 0
    deployed = 0
    
    print(f"Filtering coins: {n_coins} to process out of {n_total} total (skipping {n_total - n_coins} already deployed)")

    start_time = time.time()
    last_log_time = start_time
    last_completed = 0
    
    def process_single_coin(coin: Dict) -> Tuple[bool, bool, bool]:
        coin_id = coin["id"]
        try:
            # Step 1: Sync the coin and check response
            sync_response = sync_coin(coin_id)
            sync_success = True
            was_unverified = not coin['verified']
            
            # Step 2: Check if sync response indicates deployment is needed
            response_text = sync_response.text
            needs_deploy = "PairNotFound" in response_text
            
            # Step 3: Deploy if sync indicates it's needed
            deploy_success = False
            if needs_deploy:
                try:
                    deploy_coin(coin_id)
                    deploy_success = True
                    print(f"Deployed coin {coin_id}")
                except Exception as e:
                    pass  # Skip deploy errors
            
            return sync_success, was_unverified, deploy_success
            
        except Exception as e:
            return False, False, False  # Skip sync errors
    
    print(f"Starting sync with {'parallel' if USE_PARALLEL else 'sequential'} processing...")
    
    if USE_PARALLEL:
        # Process in batches to avoid overwhelming the database
        completed = 0
        for batch_start in range(0, n_coins, BATCH_SIZE):
            batch_end = min(batch_start + BATCH_SIZE, n_coins)
            batch = coins_to_process[batch_start:batch_end]
            batch_size = len(batch)
            
            print(f"Processing batch {batch_start//BATCH_SIZE + 1}: coins {batch_start+1}-{batch_end} ({batch_size} coins)")
            
            with ThreadPoolExecutor(max_workers=MAX_CONCURRENT_REQUESTS) as executor:
                future_to_coin = {executor.submit(process_single_coin, coin): coin for coin in batch}
                
                for future in as_completed(future_to_coin):
                    sync_success, was_unverified, deploy_success = future.result()
                    if sync_success and was_unverified:
                        verified += 1
                    if deploy_success:
                        deployed += 1
                    
                    completed += 1
                    current_time = time.time()
                    
                    # Log every 30 seconds
                    if current_time - last_log_time >= 30:
                        elapsed = current_time - last_log_time
                        requests_in_period = completed - last_completed
                        rate = requests_in_period / elapsed
                        total_elapsed = current_time - start_time
                        overall_rate = completed / total_elapsed if total_elapsed > 0 else 0
                        print(f"[{total_elapsed:.1f}s] Completed {completed}/{n_coins} coins | Last 30s: {requests_in_period} requests ({rate:.1f} req/s) | Overall: {overall_rate:.1f} req/s | Deployed: {deployed}")
                        last_log_time = current_time
                        last_completed = completed
                    
                    # Milestone logging every 1000
                    if completed % 1000 == 0:
                        total_elapsed = current_time - start_time
                        overall_rate = completed / total_elapsed if total_elapsed > 0 else 0
                        print(f"Milestone: Processed {completed}/{n_coins} coins in {total_elapsed:.1f}s ({overall_rate:.1f} req/s) | Verified: {verified}, Deployed: {deployed}")
            
            # Pause between batches to let DB recover
            if batch_end < n_coins:  # Don't pause after the last batch
                print(f"Batch complete. Pausing {BATCH_PAUSE}s to let DB recover...")
                time.sleep(BATCH_PAUSE)
    else:
        # Sequential processing
        for i, coin in enumerate(coins_to_process):
            sync_success, was_unverified, deploy_success = process_single_coin(coin)
            if sync_success and was_unverified:
                verified += 1
            if deploy_success:
                deployed += 1
            
            completed = i + 1
            current_time = time.time()
            
            if current_time - last_log_time >= 30:
                elapsed = current_time - last_log_time
                requests_in_period = completed - last_completed
                rate = requests_in_period / elapsed
                total_elapsed = current_time - start_time
                overall_rate = completed / total_elapsed if total_elapsed > 0 else 0
                print(f"[{total_elapsed:.1f}s] Completed {completed}/{n_coins} coins | Last 30s: {requests_in_period} requests ({rate:.1f} req/s) | Overall: {overall_rate:.1f} req/s | Deployed: {deployed}")
                last_log_time = current_time
                last_completed = completed
            
            if completed % 1000 == 0:
                total_elapsed = current_time - start_time
                overall_rate = completed / total_elapsed if total_elapsed > 0 else 0
                print(f"Milestone: Processed {completed}/{n_coins} coins in {total_elapsed:.1f}s ({overall_rate:.1f} req/s) | Verified: {verified}, Deployed: {deployed}")
    
    total_time = time.time() - start_time
    overall_rate = n_coins / total_time if total_time > 0 else 0
    print(f"Sync and deploy complete: {n_coins} coins in {total_time:.1f}s ({overall_rate:.1f} req/s) | Verified: {verified}, Deployed: {deployed}")
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
