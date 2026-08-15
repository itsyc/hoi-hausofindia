# Step-by-Step Guide: Deploying to Hostinger Business Web Hosting

This guide explains how to deploy your **HAUS OF INDIA** Next.js application to **Hostinger Business Web Hosting** using the Node.js Application Manager.

---

## 💡 Understanding Hostinger's Next.js Notice

Hostinger displays the message:
> *"For Next.js, you normally do not need server.js unless your project specifically uses a custom server."*

### Why we use `server.js`:
- Hostinger's hPanel Node.js Application Manager **requires a `.js` file** in the **Application Startup File** field.
- Next.js Standalone mode (`output: 'standalone'`) generates a self-contained Node production server inside `.next/standalone/server.js`.
- The root `server.js` file in this project acts as the entry point wrapper for Hostinger hPanel to launch Next.js seamlessly without needing a custom framework or extra configuration.

---

## 1. Prepare your Deployment Files

1. On your local machine, run the build command:
   ```bash
   npm run build
   ```
2. After `npm run build` finishes, your project will automatically create a standalone production bundle inside `.next/standalone/` (including all static images, CSS, JS, and database files).
3. Create a **ZIP archive** of your project:
   - **Recommended (Standalone Bundle)**: Zip the entire root project directory (including `.next`, `prisma`, `public`, `server.js`, `.env`, and `package.json`).

---

## 2. Set Up Node.js Application in Hostinger hPanel

1. Log into your **Hostinger Control Panel (hPanel)**.
2. Go to **Websites** -> click **Manage** next to your domain (`hausofindia.com` or your domain).
3. Scroll to the **Advanced** section or search for **Node.js**.
4. Click **Create Application** (or Setup Node.js App):
   - **Node.js Version**: Select **Node.js 20.x** (or highest available v20/v22).
   - **Application Mode**: Select **Production**.
   - **Application Root**: `public_html` (or your domain subfolder, e.g., `/public_html`).
   - **Application URL**: `https://yourdomain.com`
   - **Application Startup File**: `server.js`

---

## 3. Configure Environment Variables in Hostinger hPanel

In the **Node.js App Manager** under **Environment Variables**, add the following key-value pairs:

| Variable Name | Example Value | Description |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Production environment flag |
| `PORT` | `3000` (or Hostinger assigned) | Server port |
| `DATABASE_URL` | `file:./prisma/dev.db` | Path to SQLite database |
| `NEXTAUTH_SECRET` | `haus-of-india-super-secret-key` | NextAuth encryption secret |
| `NEXTAUTH_URL` | `https://yourdomain.com` | Your live website URL |
| `NEXT_PUBLIC_BASE_URL` | `https://yourdomain.com` | Public base URL for client API calls |
| `RAZORPAY_KEY_ID` | `your_live_razorpay_key` | Razorpay API Key ID |
| `RAZORPAY_KEY_SECRET` | `your_live_razorpay_secret` | Razorpay API Secret |
| `PAYU_MERCHANT_KEY` | `your_payu_key` | PayU Merchant Key |
| `PAYU_MERCHANT_SALT` | `your_payu_salt` | PayU Merchant Salt |
| `PAYU_ENV` | `PRODUCTION` | PayU environment (TEST / PRODUCTION) |

---

## 4. Install Dependencies & Start App on Hostinger

1. Open **Terminal** in Hostinger hPanel (or SSH into your Hostinger server).
2. Navigate to your Application Root (`cd public_html`).
3. Run:
   ```bash
   npm install --production
   npx prisma generate
   ```
4. Click **Run JS App** / **Restart Application** in Hostinger Node.js Manager.

> ⚡ **Browser Cache Reminder**:
> After deployment or restarting the app, changes may take a few minutes to appear due to host/browser caching. Always test with a **hard refresh**:
> - **Windows**: `Ctrl + F5` (or `Ctrl + Shift + R`)
> - **macOS**: `Cmd + Shift + R`

---

## 5. Summary of Automated Preparations Done by Assistant

- ✅ Added Linux binary targets to [prisma/schema.prisma](file:///d:/WEBSITE/hoi%20website/prisma/schema.prisma) (`debian-openssl-3.0.x`, `rhel-openssl-3.0.x`, `linux-musl-openssl-3.0.x`).
- ✅ Configured [server.js](file:///d:/WEBSITE/hoi%20website/server.js) to serve as Hostinger Node.js Manager entry point.
- ✅ Created [scripts/copy-standalone-assets.js](file:///d:/WEBSITE/hoi%20website/scripts/copy-standalone-assets.js) to bundle static images, CSS, JS, and database files into `.next/standalone/`.
- ✅ Updated [package.json](file:///d:/WEBSITE/hoi%20website/package.json) with `postbuild` hook.
- ✅ Verified `npm run build` generates a standalone production server ready for Hostinger.
