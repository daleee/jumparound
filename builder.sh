if [ "$1" == "serve" ]; then
    beefy src/game.js:bundle.js --live --open --bug=true
elif [ "$1" == "build" ]; then
    browserify src/game.js -o bundle.js
else
    echo "Jump Around Builder Script"
    echo "USAGE:"
    echo "./builder.sh build"
    echo "    Builds the bundle.js filed used to serve all JavaScript in production."
    echo "./builder.sh serve"
    echo "    Opens a light web server and your default browser. Will live-reload on file save."
fi
