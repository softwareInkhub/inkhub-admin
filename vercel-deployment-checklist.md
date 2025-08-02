# Vercel Deployment Checklist

## ✅ Pre-Deployment Checks

### 1. Environment Variables
- [ ] Set all required environment variables in Vercel dashboard
- [ ] Verify AWS credentials have correct permissions
- [ ] Ensure all DynamoDB tables exist
- [ ] Configure Cognito User Pool and App Client

### 2. External Dependencies
- [ ] Verify AWS Lambda API is accessible: `8jo83n4y51.execute-api.us-east-1.amazonaws.com`
- [ ] Ensure Redis cache service is available (if using)
- [ ] Test AWS Cognito authentication flow

### 3. Build Configuration
- [ ] Verify `next.config.js` is properly configured
- [ ] Check that all TypeScript errors are resolved
- [ ] Ensure all imports are working correctly

## 🚀 Deployment Steps

### 1. Connect to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

### 2. Configure Environment Variables
Add all variables from `vercel-env-vars.md` in the Vercel dashboard:
- Go to Project Settings > Environment Variables
- Add each variable with appropriate values
- Set environment (Production, Preview, Development)

### 3. Domain Configuration
- [ ] Configure custom domain (if needed)
- [ ] Set up SSL certificates
- [ ] Configure redirects if necessary

## 🔍 Post-Deployment Verification

### 1. Health Checks
- [ ] Test main application routes
- [ ] Verify authentication flow
- [ ] Check API endpoints functionality
- [ ] Test data loading from DynamoDB

### 2. Performance Monitoring
- [ ] Monitor build times
- [ ] Check function execution times
- [ ] Monitor error rates
- [ ] Verify cache hit rates

### 3. Security
- [ ] Verify environment variables are not exposed
- [ ] Check AWS credentials permissions
- [ ] Ensure HTTPS is enforced
- [ ] Test authentication middleware

## 🚨 Common Issues & Solutions

### Build Failures
- **Issue**: Missing environment variables
- **Solution**: Add all required env vars in Vercel dashboard

### Runtime Errors
- **Issue**: AWS credentials not configured
- **Solution**: Verify AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY

### Authentication Issues
- **Issue**: Cognito configuration errors
- **Solution**: Check NEXT_PUBLIC_COGNITO_* variables

### API Timeouts
- **Issue**: External API calls timing out
- **Solution**: Verify external services are accessible

## 📊 Monitoring Setup

### 1. Vercel Analytics
- Enable Vercel Analytics for performance monitoring
- Set up custom events for user interactions

### 2. Error Tracking
- Configure error reporting (Sentry, LogRocket, etc.)
- Set up alerts for critical errors

### 3. Performance Monitoring
- Monitor Core Web Vitals
- Track API response times
- Monitor build performance

## 🔧 Maintenance

### Regular Tasks
- [ ] Update dependencies monthly
- [ ] Review and rotate AWS credentials
- [ ] Monitor and optimize build times
- [ ] Check for security vulnerabilities

### Emergency Procedures
- [ ] Rollback to previous deployment if needed
- [ ] Contact AWS support for service issues
- [ ] Monitor Vercel status page for platform issues 