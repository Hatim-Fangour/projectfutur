
echo "Pushing the repo ..." 
current_datetime=$(date "+%B %d, %Y %I:%M %p")
git checkout -b postop
git add .
git commit -m "working on $current_datetime"
git push -u origin postop

echo "Repo is pushed ..." 

echo "Done !"