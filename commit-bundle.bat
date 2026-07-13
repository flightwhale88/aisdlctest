@echo off
cd /d C:\Users\ddc2localadmin\aisdlctest\snip-demo
git add scripts/build-bundle.mjs BUNDLE.md
git -c user.email=snip@bundle.local -c user.name="Snip Bundle" commit -m "feat: add bundle build system"
echo.
echo === Pushed commits ===
git log --oneline -3
