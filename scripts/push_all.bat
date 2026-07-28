@echo off
cd /d C:\Users\user\Escritorio\workflowacademy

git add -A

git commit -m "chore: upload workspace snapshot (as-is from local)" || echo No changes to commit

git push origin main || echo No push performed

echo Done
