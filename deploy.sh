
echo "Pushing the repo ..." 
current_datetime=$(date "+%B %d, %Y %I:%M %p")
git add .
git commit -m "working on postop at $current_datetime"
git push -u origine postop

echo "Repo is pushed ..." 

echo "Done !"