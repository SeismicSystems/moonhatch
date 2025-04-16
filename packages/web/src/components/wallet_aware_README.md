# Wallet-Aware Components

This document explains how to use the wallet-aware button components in the application.

## Problem

When users are not connected to a wallet, buttons that require wallet connection should prompt users to connect their wallet when clicked, rather than trying to perform an action that will fail.

## Solution

We've implemented a Higher-Order Component (HOC) called `requiresWallet` that wraps around buttons and other interactive components. This HOC checks if a wallet is connected before allowing the original onClick handler to execute. If no wallet is connected, it opens the wallet connection modal instead.

## Available Components

The wallet-aware button components can be imported from:

```tsx
import {
  WalletAwareButton,
  WalletAwareGraduatedTradeButton,
  WalletAwareMuiButton,
  WalletAwareNonGraduatedTradeButton,
} from '@/components/trade/wallet-aware-button'
```

These components have the same props as their non-wallet-aware counterparts, but with the added wallet connection check functionality.

## Usage

Instead of using a regular button that requires wallet connection:

```tsx
<button onClick={sendTransaction}>Send Transaction</button>
```

Use a wallet-aware button:

```tsx
<WalletAwareButton onClick={sendTransaction}>
  Send Transaction
</WalletAwareButton>
```

For trade buttons:

```tsx
<WalletAwareGraduatedTradeButton
  onClick={buyCoin}
  disabled={weiIn === null || isBuying}
  sx={{
    height: '4rem',
    borderRadius: '4rem',
    color: 'var(--creamWhite)',
    backgroundColor: 'green',
    '&:hover': { backgroundColor: 'darkgreen' },
  }}
>
  Buy Coin
</WalletAwareGraduatedTradeButton>
```

## Creating Custom Wallet-Aware Components

You can create your own wallet-aware components using the `requiresWallet` HOC:

```tsx
import { requiresWallet } from '@/components/RequiresWallet'

import { YourComponent } from './your-component'

export const WalletAwareYourComponent = requiresWallet(YourComponent)
```

The component being wrapped should accept an `onClick` prop to work correctly with the HOC.
