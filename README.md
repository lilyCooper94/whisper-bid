# Whisper Bid - Privacy-Preserving Auction Platform

A decentralized auction platform built with FHE (Fully Homomorphic Encryption) technology to ensure complete privacy for bidders while maintaining transparency and fairness in the auction process.

## Features

- **Privacy-Preserving Bidding**: All bids are encrypted using FHE technology
- **Real-time Auction Updates**: Live updates without revealing bid amounts
- **Multi-wallet Support**: Connect with Rainbow, MetaMask, and other popular wallets
- **Responsive Design**: Modern UI built with React and Tailwind CSS
- **Smart Contract Integration**: Deployed on Zama Network with FHE capabilities

## Technologies Used

- **Frontend**: React 18, TypeScript, Vite
- **UI Components**: shadcn/ui, Radix UI, Tailwind CSS
- **Wallet Integration**: RainbowKit, Wagmi, Viem
- **Blockchain**: Zama Network (FHE-enabled)
- **Smart Contracts**: Solidity with FHE encryption

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Web3 wallet (MetaMask, Rainbow, etc.)
- Zama Network RPC access

### Installation

```bash
# Clone the repository
git clone https://github.com/lilyCooper94/whisper-bid.git

# Navigate to the project directory
cd whisper-bid

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Building for Production

```bash
# Build the project
npm run build

# Preview the production build
npm run preview
```

## Smart Contract

The platform uses a smart contract deployed on Zama Network that implements:

- Encrypted bid storage using FHE
- Privacy-preserving auction logic
- Transparent winner determination
- Secure fund management

## Deployment

The application can be deployed to Vercel, Netlify, or any static hosting service. See the deployment section below for detailed instructions.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details
