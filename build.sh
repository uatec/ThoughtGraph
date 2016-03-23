#clean
rm -rf ./output
mkdir ./output

#Copy in template electron app
cp -R ./node_modules/electron-prebuilt/dist/Electron.app ./output/Thought\ Graph.app

mkdir ./output/Thought\ Graph.app/Contents/Resources/app
# Copy in the package description
cp -R ./package.json ./output/Thought\ Graph.app/Contents/Resources/app/package.json
# Copy in the back end
cp -R ./src ./output/Thought\ Graph.app/Contents/Resources/app/src
# Copy in the front end
cp -R ./build ./output/Thought\ Graph.app/Contents/Resources/app/build

# Copy in the Icon
# Copy in the plist
# Rename helper EH
# - App
# - plist
# Rename helper NP
# - App
# - plist