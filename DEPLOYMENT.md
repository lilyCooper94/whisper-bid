# Vercel Deployment Guide for Whisper Bid

This guide provides step-by-step instructions for deploying the Whisper Bid application to Vercel.

## Prerequisites

- A Vercel account (free tier available)
- GitHub account with access to the whisper-bid repository
- WalletConnect Project ID (optional, for enhanced wallet connectivity)

## Step-by-Step Deployment Instructions

### 1. Access Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Sign in with your GitHub account
3. Click on "New Project" or the "+" button

### 2. Import GitHub Repository

1. In the "Import Git Repository" section, search for `lilyCooper94/whisper-bid`
2. Click on the repository when it appears
3. Click "Import" to proceed

### 3. Configure Project Settings

#### Basic Configuration:
- **Project Name**: `whisper-bid` (or your preferred name)
- **Framework Preset**: Select "Vite" from the dropdown
- **Root Directory**: Leave as default (`.`)
- **Build Command**: `npm run build` (should auto-detect)
- **Output Directory**: `dist` (should auto-detect)
- **Install Command**: `npm install` (should auto-detect)

#### Environment Variables (Optional but Recommended):
**Note**: Environment variables are optional. The application will work without them, but adding them will enhance functionality.

Click "Add Environment Variable" and add the following if desired:

1. **VITE_WALLETCONNECT_PROJECT_ID** (Optional)
   - Value: Your WalletConnect Project ID (get from [cloud.walletconnect.com](https://cloud.walletconnect.com))
   - Environment: Production, Preview, Development
   - **Note**: If not provided, the app will use default WalletConnect settings

2. **VITE_RPC_URL** (Optional)
   - Value: Your preferred RPC URL (e.g., `https://sepolia.infura.io/v3/YOUR_PROJECT_ID`)
   - Environment: Production, Preview, Development
   - **Note**: If not provided, the app will use public RPC endpoints

3. **VITE_CHAIN_ID** (Optional)
   - Value: `11155111` (for Sepolia testnet) or `1` (for Ethereum mainnet)
   - Environment: Production, Preview, Development
   - **Note**: If not provided, the app will default to Sepolia testnet

### 4. Deploy the Application

1. Click "Deploy" button
2. Wait for the build process to complete (usually 2-5 minutes)
3. Once deployed, you'll see a success message with your deployment URL

### 5. Configure Custom Domain (Optional)

1. In your project dashboard, go to "Settings" → "Domains"
2. Click "Add Domain"
3. Enter your custom domain (e.g., `whisperbid.com`)
4. Follow the DNS configuration instructions provided by Vercel
5. Wait for DNS propagation (can take up to 24 hours)

### 6. Configure Automatic Deployments

The project is already configured for automatic deployments:
- **Production**: Deploys automatically when you push to the `main` branch
- **Preview**: Creates preview deployments for pull requests
- **Development**: Deploys from other branches

### 7. Monitor and Manage Deployments

1. Go to the "Deployments" tab in your Vercel dashboard
2. View deployment history and status
3. Click on any deployment to see logs and details
4. Use the "Redeploy" button to trigger manual deployments

## Important Configuration Notes

### WalletConnect Setup (Recommended)
1. Visit [cloud.walletconnect.com](https://cloud.walletconnect.com)
2. Create a new project
3. Copy the Project ID
4. Add it as `VITE_WALLETCONNECT_PROJECT_ID` environment variable

### RPC Configuration
- For Sepolia testnet: Use Infura, Alchemy, or other RPC providers
- For mainnet: Ensure you have sufficient API limits
- Consider using multiple RPC endpoints for redundancy

### Build Optimization
The project includes:
- Automatic code splitting
- Tree shaking for unused code
- Optimized bundle size
- Modern JavaScript features

## Troubleshooting

### Common Issues:

1. **Build Failures**
   - Check the build logs in Vercel dashboard
   - Ensure all dependencies are properly installed
   - Verify TypeScript compilation

2. **Environment Variables Not Working**
   - Ensure variables start with `VITE_` prefix
   - Redeploy after adding new environment variables
   - Check variable names for typos

3. **Wallet Connection Issues**
   - Verify WalletConnect Project ID is correct
   - Check RPC URL is accessible
   - Ensure chain ID matches your target network

4. **Domain Issues**
   - Verify DNS settings are correct
   - Wait for DNS propagation
   - Check SSL certificate status

### Performance Optimization:

1. **Enable Vercel Analytics** (Optional)
   - Go to project settings
   - Enable "Vercel Analytics"
   - Monitor performance metrics

2. **Configure Edge Functions** (Advanced)
   - For server-side functionality
   - API routes and middleware

## Post-Deployment Checklist

- [ ] Application loads without errors
- [ ] Wallet connection works properly
- [ ] All pages are accessible
- [ ] Mobile responsiveness is working
- [ ] Environment variables are properly set
- [ ] Custom domain is configured (if applicable)
- [ ] SSL certificate is active
- [ ] Analytics are working (if enabled)

## Support and Maintenance

- Monitor deployment logs regularly
- Keep dependencies updated
- Test new features in preview deployments
- Use Vercel's built-in monitoring tools
- Consider setting up error tracking (Sentry, etc.)

## Cost Considerations

- **Vercel Free Tier**: 100GB bandwidth, 100 serverless function executions
- **Pro Tier**: $20/month for increased limits
- **Enterprise**: Custom pricing for large-scale applications

For more information, visit the [Vercel Documentation](https://vercel.com/docs).
