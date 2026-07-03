# BloodLink India

A GitHub-first, production-ready HealthTech web application connecting users to lifesaving blood banks across India.

## Architecture Highlights
* **Frontend:** React + Vite + TypeScript
* **Hosting:** Cloudflare Pages
* **Authentication:** Firebase Auth (Google Sign-In)
* **Analytics:** Google Analytics 4
* **Data Automation:** GitHub Actions running every 4 hours to update blood stock data.

## Setup Instructions

### 1. GitHub Repository Setup
1. Create a new repository on GitHub.
2. Initialize this project locally and push to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```

### 2. Environment Variables Documentation
Copy the `.env.example` file to a new file named `.env` and fill in your Firebase details:
```bash
cp .env.example .env
```
These variables must also be added to Cloudflare Pages for the production build.

### 3. Cloudflare Pages Deployment
Cloudflare Pages is configured to deploy directly from this GitHub repository.
1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. Navigate to **Workers & Pages** -> **Create application** -> **Pages** -> **Connect to Git**.
3. Select this GitHub repository.
4. Set the build settings:
   - **Framework preset:** Vite
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
5. **CRITICAL:** Under "Environment variables (advanced)", add all the `VITE_FIREBASE_*` variables from your `.env` file.
6. Click **Save and Deploy**. 
7. Every push to the `main` branch will now automatically trigger a redeploy on Cloudflare.

### 4. GitHub Actions (Automated Data Updates)
The project includes a GitHub Actions workflow (`.github/workflows/update-blood-data.yml`) that runs every 4 hours.
- It fetches the latest blood bank data using `scripts/fetchBloodData.js`.
- It generates compressed JSON files (`blood_stock.json.gz`).
- It commits and pushes the updated data back to the `main` branch.
- **Note:** Because the workflow pushes a new commit to `main`, Cloudflare Pages will automatically catch the push and redeploy the site with the fresh data!

### Local Development
```bash
npm install
npm run dev
```
