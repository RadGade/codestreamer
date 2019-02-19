// var streamId = "example";//window.location.hash.replace('#', '');

var mimeCodec = 'video/webm; codecs="opus,vp8"';
// var gun = Gun('https://gunjs.herokuapp.com/gun');
localStorage.clear();
var opt = {};
opt.store = RindexedDB(opt);
var gunDB = Gun('https://gunjs.herokuapp.com/gun', opt);

remoteVideo = document.getElementById("remote_video");
var mediaSource = new MediaSource;
var sourceBuffer;

remoteVideo.src = URL.createObjectURL(mediaSource);
mediaSource.addEventListener('sourceopen', sourceOpen);
localStorage.clear();

console.log(streamId);
function startLoading() {
    URL.revokeObjectURL(remoteVideo.src);
    gunDB.get('stream/' + streamId).on(function (data) {
        sourceBuffer.abort();
        if (sourceBuffer.timestampOffset > 600) {
            sourceBuffer.remove(0, (sourceBuffer.timestampOffset - 600));
        }
        if (data.name.startsWith("GkXf") && (!remoteVideo.paused || remoteVideo.played.length == 0)) {
            var t0 = performance.now();
            addToSourceBuffer(data.name);
            var t1 = performance.now();
            console.log("Call to doSomething took " + (t1 - t0) + " milliseconds.");
            localStorage.clear();
        }
    });
}

function addToSourceBuffer(b64Data) {
    const byteCharacters = atob(b64Data);
    const byteArray = str2ab(byteCharacters);

    if (!sourceBuffer.updating) {
        sourceBuffer.appendBuffer(byteArray);
    }
}

function str2ab(str) {
    var buf = new ArrayBuffer(str.length);
    var bufView = new Uint8Array(buf);
    for (var i = 0, strLen = str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i);
    }
    return buf;
}

function sourceOpen(_) {
    console.log("Open");
    var mediaSource = this;
    sourceBuffer = mediaSource.addSourceBuffer(mimeCodec);
    sourceBuffer.mode = 'sequence';
    startLoading();
}

function addToBuffer(data) {
    var reader = new FileReader();
    reader.addEventListener("loadend", function () {
        var arr = new Uint8Array(reader.result);
        if (!sourceBuffer.updating) {
            sourceBuffer.appendBuffer(arr);
        }
    });
    reader.addEventListener("error", function (err) {
        console.log(err);
    });
    reader.readAsArrayBuffer(data);
}

// var vidBlob = Base64ToBlob(data.name)
// addToBuffer(vidBlob);
function Base64ToBlob(b64Data, contentType = mimeCodec, sliceSize = 512) {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        const slice = byteCharacters.slice(offset, offset + sliceSize);
        const byteNumbers = new Array(slice.length);

        for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
    }

    const blob = new Blob(byteArrays, { type: contentType });
    return blob;
}
