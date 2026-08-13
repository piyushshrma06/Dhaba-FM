/* =========================================================
   1. LIVE CLOCK
   ========================================================= */
function updateClock(){
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' });
  const dateStr = now.toLocaleDateString([], { weekday:'short', day:'numeric', month:'short' });
  document.getElementById('clock').textContent = timeStr;
  document.getElementById('clock-date').textContent = dateStr;
}
updateClock();
setInterval(updateClock, 1000);

/* =========================================================
   2. SAFAR COUNTER — simulated live listener count
   ========================================================= */
let safarCount = 1214;
function driftSafarCount(){
  const step = Math.floor(Math.random() * 7) - 3; // -3..+3
  safarCount = Math.min(1250, Math.max(1200, safarCount + step));
  document.getElementById('safar-count').textContent = safarCount.toLocaleString();
}
setInterval(driftSafarCount, 2600);

/* =========================================================
   3. CB RADIO CHATTER — fleeting anonymous messages
   ========================================================= */
const cbMessages = [
  "Checking in from MP 🚚",
  "Late night study vibes",
  "Chai stop, back in 5",
  "Anyone else awake at this hour?",
  "Rajasthan border, clear skies",
  "This lofi hits different at 2am",
  "Trucker from Nashik, over.",
  "Coding till sunrise ✨",
  "Ghat road, slow and steady",
  "Dhaba chai > everything",
  "Long haul, good company",
  "Highway hypnosis, send lofi"
];
const cbPanel = document.getElementById('cb-panel');

function postCbMessage(){
  const msg = document.createElement('div');
  msg.className = 'cb-msg';
  msg.textContent = cbMessages[Math.floor(Math.random() * cbMessages.length)];
  cbPanel.appendChild(msg);

  // keep the stack short
  while (cbPanel.children.length > 5) {
    cbPanel.removeChild(cbPanel.children[1]); 
  }

  // fade out and remove after ~4 seconds
  setTimeout(() => {
    msg.classList.add('fade');
    setTimeout(() => msg.remove(), 600);
  }, 4000);
}
setInterval(postCbMessage, 3200);
postCbMessage();

/* =========================================================
   4. HONK / DIPPER BUTTON
   ========================================================= */
const hornAudio = document.getElementById('horn-audio');
const honkBtn = document.getElementById('honk-btn');
const honkFlash = document.getElementById('honk-flash');
const honkRipple = document.getElementById('honk-ripple');

honkBtn.addEventListener('click', () => {
  hornAudio.currentTime = 0;
  hornAudio.play().catch(() => {/* autoplay-policy safe no-op */});

  honkFlash.classList.remove('active');
  honkRipple.classList.remove('active');
  // reflow to restart CSS animations reliably
  void honkFlash.offsetWidth;
  void honkRipple.offsetWidth;
  honkFlash.classList.add('active');
  honkRipple.classList.add('active');
});

/* ---- lorry horn button (uploaded mp3) ---- */
const lorryHornAudio = document.getElementById('lorry-horn-audio');
const hornBtn = document.getElementById('horn-btn');
const hornFlash = document.getElementById('horn-flash');
const hornRipple = document.getElementById('horn-ripple');

hornBtn.addEventListener('click', () => {
  lorryHornAudio.currentTime = 0;
  lorryHornAudio.play().catch(() => {/* autoplay-policy safe no-op */});

  hornFlash.classList.remove('active');
  hornRipple.classList.remove('active');
  document.body.classList.remove('horn-shake');
  // reflow to restart CSS animations reliably
  void hornFlash.offsetWidth;
  void hornRipple.offsetWidth;
  void document.body.offsetWidth;
  hornFlash.classList.add('active');
  hornRipple.classList.add('active');
  document.body.classList.add('horn-shake');
});

/* =========================================================
   5. YOUTUBE IFRAME PLAYER API — "Ustad's Radio"
   ========================================================= */
const PLAYLIST_ID = 'PLP-ehMFOLJFg'; // Dhaba FM playlist
const START_VIDEO_ID = 'yqtGt2IjyKg'; // first track — loading with an explicit videoId avoids the playlist-only load failing with errorCode "auth"

let ytPlayer;
let isPlaying = false;
let progressTimer;

// Required global callback name expected by the YouTube IFrame API.
function onYouTubeIframeAPIReady(){
  ytPlayer = new YT.Player('yt-player', {
    height: '1',
    width: '1',
    host: 'https://www.youtube-nocookie.com',
    videoId: START_VIDEO_ID,
    playerVars: {
      listType: 'playlist',
      list: PLAYLIST_ID,
      autoplay: 0,
      controls: 0
    },
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange,
      onError: onPlayerError
    }
  });
}

function onPlayerReady(){
  document.getElementById('track-title').textContent = 'Ready — press play';
}

// error codes: 2=invalid id, 5=HTML5 error, 100=video removed/private, 101 & 150=embedding disabled by uploader
function onPlayerError(event){
  console.warn('YouTube player error code:', event.data, '— skipping to next track.');
  document.getElementById('track-title').textContent = 'Track unavailable — skipping…';
  setTimeout(() => {
    if (!ytPlayer) return;
    ytPlayer.nextVideo();
    ytPlayer.playVideo();
    setTimeout(updateTrackInfo, 400);
  }, 600);
}

function onPlayerStateChange(event){
  if (event.data === YT.PlayerState.PLAYING){
    isPlaying = true;
    document.getElementById('play-btn').textContent = '⏸';
    updateTrackInfo();
    startProgressLoop();
  } else if (event.data === YT.PlayerState.PAUSED){
    isPlaying = false;
    document.getElementById('play-btn').textContent = '▶';
    stopProgressLoop();
  }
}

function updateTrackInfo(){
  try{
    const data = ytPlayer.getVideoData();
    const title = (data && data.title) ? data.title : 'Highway Lofi Mix';
    document.getElementById('track-title').textContent = title;
  }catch(e){
    document.getElementById('track-title').textContent = 'Highway Lofi Mix';
  }
}

function formatTime(sec){
  sec = Math.floor(sec || 0);
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return m + ':' + String(s).padStart(2, '0');
}

function startProgressLoop(){
  stopProgressLoop();
  progressTimer = setInterval(() => {
    if (!ytPlayer || !ytPlayer.getCurrentTime) return;
    const current = ytPlayer.getCurrentTime();
    const duration = ytPlayer.getDuration();
    const bar = document.getElementById('progress-bar');

    if (duration > 0){
      const pct = (current / duration) * 100;
      bar.value = pct;
      bar.style.setProperty('--progress', pct + '%');
    }
    document.getElementById('time-current').textContent = formatTime(current);
    document.getElementById('time-total').textContent = formatTime(duration);
  }, 500);
}
function stopProgressLoop(){
  clearInterval(progressTimer);
}

/* ---- custom control buttons wired to the hidden player ---- */
document.getElementById('play-btn').addEventListener('click', () => {
  if (!ytPlayer) return;
  if (isPlaying){ ytPlayer.pauseVideo(); }
  else{ ytPlayer.playVideo(); }
});
document.getElementById('next-btn').addEventListener('click', () => {
  if (!ytPlayer) return;
  ytPlayer.nextVideo();
  ytPlayer.playVideo();
  setTimeout(updateTrackInfo, 400);
});
document.getElementById('prev-btn').addEventListener('click', () => {
  if (!ytPlayer) return;
  ytPlayer.previousVideo();
  ytPlayer.playVideo();
  setTimeout(updateTrackInfo, 400);
});

// Let the listener drag the progress bar to seek within the current track.
document.getElementById('progress-bar').addEventListener('input', (e) => {
  if (!ytPlayer || !ytPlayer.getDuration) return;
  const duration = ytPlayer.getDuration();
  const seekTo = (e.target.value / 100) * duration;
  ytPlayer.seekTo(seekTo, true);
});

// Load the YouTube IFrame API script asynchronously.
const ytScriptTag = document.createElement('script');
ytScriptTag.src = 'https://www.youtube.com/iframe_api';
document.head.appendChild(ytScriptTag);