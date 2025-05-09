## Initial Configuration & Deployment
1. Build Your Vue 3 App
```bash
npm run build
```

2. Create an S3 Bucket for Hosting
```bash
aws s3api create-bucket --bucket code4u.innoaya.org --create-bucket-configuration LocationConstraint=ap-southeast-1
```

3. Configure S3 Bucket for Static Website Hosting (Make it publicly readable)
```bash
aws s3 website s3://code4u.innoaya.org/ --index-document index.html --error-document index.html

aws s3api put-public-access-block   --bucket code4u.innoaya.org   --public-access-block-configuration BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false

cd deployment

aws s3api put-bucket-policy --bucket code4u.innoaya.org --policy file://bucket-policy.json

cd ..
```

4. Deploy Your App (Sync Your Build Folder to S3)
```bash
aws s3 sync dist/ s3://code4u.innoaya.org/ --delete
```

5. Create CloudFront Distribution
```bash
aws cloudfront create-distribution --origin-domain-name code4u.innoaya.org.s3-website-ap-southeast-1.amazonaws.com
```

6. Update your DNS record to point to the CloudFront distribution domain name. Route53
```bash
cd deployment

aws route53 change-resource-record-sets --hosted-zone-id Z0130296EQP34SB7RMM2 --change-batch file://dns-records.json

cd ..
```

7. Set Up SSL (HTTPS) with ACM
```bash
aws acm request-certificate --domain-name code4u.innoaya.org --validation-method DNS
```

### Deploy Updates after code changes
```bash
aws s3 sync dist/ s3://code4u.innoaya.org/ --delete
aws cloudfront create-invalidation --distribution-id E2GFBUCWIF2RUF --paths "/*"
```

