if [ "$1" == "serve" ]; then
    beefy src/game.js:bundle.js --live --open --bug=true
elif [ "$1" == "build" ]; then
    browserify src/game.js -o bundle.js
fi
