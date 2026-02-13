# Security Policy

## Reporting a Vulnerability

Please do not open public issues for security vulnerabilities. Instead, email your findings to info@cemilmericokulu.k12.tr

## Security Practices

### Firebase Configuration
- Never commit `.env` files with real credentials
- Use environment variables for sensitive data
- Rotate API keys regularly

### Authentication
- Passwords must be at least 6 characters
- Use HTTPS only
- Implement rate limiting on login attempts
- Store sensitive data in Firestore with proper security rules

### Data Protection
- All user data is encrypted in transit (HTTPS)
- Implement proper Firestore security rules
- Regular security audits recommended
- GDPR compliant data handling

### Input Validation
- All user inputs are validated on client and server
- SQL injection prevention
- XSS prevention through HTML escaping
- CSRF protection tokens

## Security Headers
```
Content-Security-Policy: default-src 'self'
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

## Updates and Patches
- Keep all dependencies up to date
- Monitor security advisories
- Apply patches promptly