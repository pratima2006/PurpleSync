import { useState } from 'react';
import { ArrowUpRight, Music2, ArrowLeft } from 'lucide-react';
import { memberItems } from '../components/data';
import { SectionHeading } from '../components/SectionHeading';

const toneClasses: Record<string, string> = {
  lavender: 'bg-[#eee5f7] text-[#73539a]',
  peach: 'bg-[#f5e8dd] text-[#996d4d]',
  blue: 'bg-[#e4edf4] text-[#59728a]',
  gold: 'bg-[#f5ead1] text-[#96733a]',
  rose: 'bg-[#f3e3e9] text-[#a06177]',
  mint: 'bg-[#e2f0ea] text-[#5f8c76]',
  plum: 'bg-[#e4dff1] text-[#654d8e]',
};

// Tera wala data - ek bhi change nahi kiya
const discographyData: Record<string, any[]> = {
  BANGTAN: [
    { title: "ARIRANG", date: "MAR 20, 2026", tracks: "14 Tracks", type: "5th Studio Album", cover: "https://ibighit.com/public%2FalbumThumbnail%2F1773981474263_0cb62e90f1f0429ba00f98adf42a7aa9.jpg", links: { spotify: "https://open.spotify.com/album/3ukkRHDHbN8tNRPKsGZR1h?si=w97kCaATR9i3wq8e-m2K4A", apple: "https://music.apple.com/us/album/arirang/1868481904", melon: "https://www.melon.com/album/detail.htm?albumId=12927820" }, desc: "Arirang is a monumental return marking BTS's 13th anniversary. Drawing from Korea's most beloved folk song, the album blends traditional Korean instruments with modern production, exploring themes of identity, reunion, and enduring legacy." },
    { title: "PERMISSION TO DANCE ON STAGE - LIVE", date: "MAR 20, 2026", tracks: "22 Tracks", type: "1st live album", cover: "https://ibighit.com/public%2FalbumThumbnail%2F2026-01-16_291_discography-cover%2520%2810%29.jpg", links: { spotify: "https://open.spotify.com/album/7xLhqoM0ilHRKUg2irVSDI?si=66e6554b31654209", apple: "https://music.apple.com/in/album/permission-to-dance-on-stage-live/1823627665", melon: "https://www.melon.com/album/detail.htm?albumId=11905250" }, desc: "Permission to Dance On Stage Live captures the electric energy of BTS's world tour, recorded live from their Seoul Olympic Stadium finale." },
    { title: "TAKE TWO", date: "JUN 9, 2025", tracks: "1 Tracks", type: "Digital single", cover: "https://ibighit.com/public/bts/images/bts/discography/take-two/album-cover.png", links: { spotify: "https://open.spotify.com/album/3jeQDa9OFZ6GndLindHx3k?si=fd10ad660232448b", apple: "https://music.apple.com/in/song/take-two/1690421575", melon: "https://www.melon.com/song/detail.htm?songId=36516320" }, desc: "Take Two is a heartfelt fan song celebrating 10 years of BTS and ARMY walking together." },
    { title: "PROOF", date: "JUN 10, 2022", tracks: "48 Tracks", type: " first anthology album", cover: "https://ibighit.com/public%2FalbumThumbnail%2F2026-01-16_364_discography-cover%2520%2835%29.png", links: { spotify: "https://open.spotify.com/album/6al2VdKbb6FIz9d7lU7WRB?si=337ab49e284b4e50", apple: "https://music.apple.com/in/album/proof/1627573936", melon: "https://www.melon.com/album/detail.htm?albumId=10979636" }, desc: "Proof is an anthology that chronicles BTS's journey from 2013 to 2022, including 3 new tracks and remastered hits." },
    { title: "BUTTER & PERMISSION TO DANCE", date: "JUL 9, 2021", tracks: "4 Tracks", type: "Single CD", cover: "https://ibighit.com/public%2FalbumThumbnail%2F2026-01-16_954_butter-2-cover%2520%281%29.jpg", links: { spotify: "https://open.spotify.com/album/0E4HPJE6DPIc2OUmJ8rTP0?si=6150bfa00f094dd9", apple: "https://music.apple.com/in/album/butter-permission-to-dance-ep/1598666015", melon: "https://www.melon.com/album/detail.htm?albumId=10648182" }, desc: "Single CD featuring the global summer hits Butter and Permission to Dance." },
    { title: "BUTTER", date: "MAY 21, 2021", tracks: "2 Tracks", type: "Digital single", cover: "https://ibighit.com/public%2FalbumThumbnail%2F2026-01-16_229_butter-cover%2520%281%29.jpg", links: { spotify: "https://open.spotify.com/album/0PBQ3Cp6NG8WX0G9KQVNMP?si=s9JxbbJwRJ6_I5glvSUmKg", apple: "https://music.apple.com/in/album/butter-hotter-sweeter-cooler-ep/1598660388", melon: "https://www.melon.com/album/detail.htm?albumId=10612483" }, desc: "Butter is a dance-pop anthem that broke Spotify and YouTube records on release." },
  ],
  RM: [
    { title: "Right Place, Wrong Person", date: "May 24, 2024", tracks: "11 Tracks", type: "2nd Album", cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400", links: { spotify: "https://open.spotify.com/album/5pSk3cfs4d5F0oS3R0wG6o", apple: "https://music.apple.com/album/1732297281", melon: "https://www.melon.com/album/detail.htm?albumId=11487058" }, desc: "Right Place, Wrong Person is RM's most introspective work, exploring displacement and self." },
    { title: "Indigo", date: "Dec 2, 2022", tracks: "10 Tracks", type: "1st Album", cover: "https://images.unsplash.com/photo-1496293455970-f8581aae0e3b?w=400", links: { spotify: "#", apple: "#", melon: "#" }, desc: "Indigo is described by RM as an archive of his twenties." },
    { title: "mono.", date: "Oct 23, 2018", tracks: "7 Tracks", type: "Playlist", cover: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400", links: { spotify: "#", apple: "#", melon: "#" }, desc: "Mono is a deeply personal playlist released in 2018." },
  ],
  Jin: [
    { title: "Echo", date: "May 16, 2025", tracks: "7 Tracks", type: "Mini Album", cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400", links: { spotify: "#", apple: "#", melon: "#" }, desc: "Echo is Jin's second mini album." },
    { title: "Happy", date: "Nov 15, 2024", tracks: "6 Tracks", type: "Mini Album", cover: "https://images.unsplash.com/photo-1496293455970-f8581aae0e3b?w=400", links: { spotify: "#", apple: "#", melon: "#" }, desc: "Happy is Jin's debut solo mini album." },
    { title: "Super Tuna", date: "Dec 4, 2021", tracks: "1 Track", type: "Single", cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400", links: { spotify: "#", apple: "#", melon: "#" }, desc: "Super Tuna is a fun trot-style special single for fans." },
  ],
  Suga: [
    { title: "D-DAY", date: "Apr 21, 2023", tracks: "10 Tracks", type: "Album", cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400", links: { spotify: "#", apple: "#", melon: "#" }, desc: "D-DAY is the final chapter of Agust D trilogy." },
    { title: "Agust D", date: "Aug 15, 2016", tracks: "10 Tracks", type: "Mixtape", cover: "https://images.unsplash.com/photo-1496293455970-f8581aae0e3b?w=400", links: { spotify: "#", apple: "#", melon: "#" }, desc: "First mixtape as Agust D." },
  ],
  "J-Hope": [
    { title: "HOPE ON THE STREET VOL.1", date: "Mar 29, 2024", tracks: "6 Tracks", type: "Special Album", cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400", links: { spotify: "#", apple: "#", melon: "#" }, desc: "Soundtrack to his dance documentary." },
    { title: "Jack In The Box", date: "Jul 15, 2022", tracks: "10 Tracks", type: "Album", cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400", links: { spotify: "#", apple: "#", melon: "#" }, desc: "Jack In The Box explores new soundscapes." },
    { title: "Killin' It Girl", date: "Jun 13, 2025", tracks: "1 Track", type: "Single", cover: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400", links: { spotify: "#", apple: "#", melon: "#" }, desc: "Latest single collaboration." },
  ],
  Jimin: [
    { title: "MUSE", date: "Jul 19, 2024", tracks: "7 Tracks", type: "Album", cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400", links: { spotify: "#", apple: "#", melon: "#" }, desc: "MUSE is Jimin's second solo album." },
    { title: "FACE", date: "Mar 24, 2023", tracks: "6 Tracks", type: "Album", cover: "https://images.unsplash.com/photo-1496293455970-f8581aae0e3b?w=400", links: { spotify: "#", apple: "#", melon: "#" }, desc: "FACE explores Jimin's inner self." },
    { title: "Promise", date: "Dec 31, 2018", tracks: "1 Track", type: "Single", cover: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400", links: { spotify: "#", apple: "#", melon: "#" }, desc: "First self-composed solo track." },
  ],
  V: [
    { title: "Layover", date: "Sep 8, 2023", tracks: "6 Tracks", type: "Mini Album", cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400", links: { spotify: "#", apple: "#", melon: "#" }, desc: "Layover is V's debut solo album with jazz and R&B tones." },
    { title: "FRI(END)S", date: "Mar 15, 2024", tracks: "3 Tracks", type: "Single", cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400", links: { spotify: "#", apple: "#", melon: "#" }, desc: "FRI(END)S is a pop soul single." },
    { title: "Winter Bear", date: "Aug 9, 2019", tracks: "1 Track", type: "Single", cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400", links: { spotify: "#", apple: "#", melon: "#" }, desc: "Winter Bear is a self-directed visual and song." },
  ],
  Jungkook: [
    { title: "GOLDEN", date: "Nov 3, 2023", tracks: "11 Tracks", type: "Album", cover: "https://images.unsplash.com/photo-1496293455970-f8581aae0e3b?w=400", links: { spotify: "#", apple: "#", melon: "#" }, desc: "GOLDEN is inspired by Jungkook's golden moments." },
    { title: "My You", date: "Jun 13, 2022", tracks: "1 Track", type: "Fan Song", cover: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400", links: { spotify: "#", apple: "#", melon: "#" }, desc: "My You is a fan song dedicated to ARMY." },
    { title: "Still With You", date: "Jul 4, 2020", tracks: "1 Track", type: "Self-Produced", cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400", links: { spotify: "#", apple: "#", melon: "#" }, desc: "Still With You is a self-produced ballad." },
  ],
};

function AlbumRow({ album, onOpen }: { album: any; onOpen: () => void }) {
  const [coverHover, setCoverHover] = useState(false);
  const validLinks = Object.entries(album.links).filter(([_, url]: any) => url && url !== "#" && url.trim() !== "");

  return (
    <div className="flex flex-col md:flex-row items-start gap-6 md:gap-16 rounded-2xl border border-[#e0d4ed] bg-white p-5">
      {/* COVER - SIRF DESKTOP PE DISC */}
      <div 
        className="relative h-[220px] w-[220px] shrink-0 cursor-pointer"
        onMouseEnter={() => setCoverHover(true)}
        onMouseLeave={() => setCoverHover(false)}
        onClick={onOpen}
      >
        {/* DISC - DESKTOP PE HI - MOBILE PE HIDDEN */}
        <div 
          className="absolute top-1/2 left-1/2 h-[200px] w-[200px] rounded-full bg-[#121212] hidden md:flex items-center justify-center transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
          style={{ 
            boxShadow: '0 0 0 4px #222',
            transform: coverHover ? 'translate(-10%, -50%) rotate(180deg)' : 'translate(-50%, -50%) rotate(0deg) scale(0.9)',
            opacity: coverHover ? 1 : 0
          }}
        >
          <div className="h-full w-full rounded-full flex items-center justify-center" style={{ background: 'repeating-radial-gradient(circle at center, #222 0 2px, #111 2px 4px)', animation: coverHover ? 'spin 3s linear infinite' : 'none' }}>
            <div className="h-8 w-8 rounded-full bg-[#704ca5] border-4 border-black" />
          </div>
        </div>

        <div 
          className="relative z-10 h-full w-full overflow-hidden rounded-xl shadow-md transition-all duration-500"
          style={{ transform: coverHover ? 'rotate(-4deg) translateY(-4px) scale(1.02)' : 'rotate(0deg)' }}
        >
          <img src={album.cover} alt={album.title} className="h-full w-full object-cover" />
        </div>
      </div>

      <div className="flex-1 pt-1">
        <p className="ps-mono text-[9px] text-[#aa9eac]">{album.type}</p>
        <h3 className="mt-1 text-[18px] font-bold leading-tight text-[#332840]">{album.title}</h3>
        <div className="mt-2 flex gap-2 flex-wrap">
          <span className="rounded-full bg-[#f1e9f9] px-3 py-1 text-[10px]">{album.date}</span>
          <span className="rounded-full bg-[#eee5f7] px-3 py-1 text-[10px] text-[#704ca5]">{album.tracks}</span>
        </div>
        {/* SMALL ICONS - ONLY VALID LINKS */}
        <div className="mt-5 flex gap-2 flex-wrap">
          {validLinks.map(([platform, url]: any) => {
            if (platform === 'spotify') return <a key={platform} href={url} target="_blank" onClick={e=>e.stopPropagation()} className="grid h-7 w-7 place-items-center rounded-full bg-black hover:scale-110 transition-transform"><img src="https://upload.wikimedia.org/wikipedia/commons/8/84/Spotify_icon.svg" className="h-7 w-7 rounded-full" /></a>;
            if (platform === 'youtube' || platform === 'yt') return <a key={platform} href={url} target="_blank" onClick={e=>e.stopPropagation()} className="grid h-7 w-7 place-items-center rounded-full bg-[#FF0000] hover:scale-110 transition-transform"><svg width="14" height="10" viewBox="0 0 24 24" fill="white"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg></a>;
            if (platform === 'apple') return <a key={platform} href={url} target="_blank" onClick={e=>e.stopPropagation()} className="grid h-7 w-7 place-items-center rounded-full overflow-hidden hover:scale-110 transition-transform"><img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" className="h-7 w-7 bg-white p-1 rounded-full" /></a>;
            if (platform === 'melon') return <a key={platform} href={url} target="_blank" onClick={e=>e.stopPropagation()} className="grid h-7 w-7 place-items-center rounded-[8px] bg-[#00D344] text-white font-black text-[10px] hover:scale-110 transition-transform">M</a>;
            return null;
          })}
        </div>
        <p className="mt-3 text-[10px] text-[#aa9eac] md:hidden">Tap cover to open detail page</p>
      </div>
    </div>
  );
}

function AlbumDetail({ album, member, onBack }: { album: any; member: string; onBack: () => void }) {
  const validLinks = Object.entries(album.links).filter(([_, url]: any) => url && url !== "#" && url.trim() !== "");
  const firstWord = album.desc.split(' ')[0];
  const restDesc = album.desc.substring(firstWord.length);

  return (
    <div className="ps-page-enter ps-content py-8 md:py-10">
      <button onClick={onBack} className="mb-6 flex items-center gap-2 rounded-full border border-[#e0d4ed] bg-white px-4 py-2 text-[12px] text-[#6d5a82] hover:bg-[#f1e9f9]">
        <ArrowLeft size={14}/> Back to {member === 'BANGTAN' ? 'Bangtan' : member}
      </button>

      <div className="grid gap-6 md:grid-cols-[320px_1fr]">
        {/* BOX 1 - ALBUM WITH DISC */}
        <div className="rounded-2xl border border-[#e0d4ed] bg-white p-6 flex-col items-center">
          <div className="relative h-[240px] w-[240px]">
            <div className="absolute top-1/2 left-1/2 h-[220px] w-[220px] rounded-full bg-[#121212] flex items-center justify-center" style={{ transform: 'translate(-10%, -50%)', boxShadow: '0 0 0 5px #222' }}>
              <div className="h-full w-full rounded-full animate-[spin_3s_linear_infinite] flex items-center justify-center" style={{ background: 'repeating-radial-gradient(circle at center, #222 0 2px, #111 2px 4px)' }}>
                <div className="h-9 w-9 rounded-full bg-[#704ca5] border-4 border-black" />
              </div>
            </div>
            <div className="relative z-10 h-full w-full rounded-xl overflow-hidden shadow-xl">
              <img src={album.cover} alt={album.title} className="h-full w-full object-cover" />
            </div>
          </div>
          <div className="mt-6 flex gap-2">
            {validLinks.map(([platform, url]: any) => {
              if (platform === 'spotify') return <a key={platform} href={url} target="_blank" className="grid h-7 w-7 place-items-center rounded-full bg-black"><img src="https://upload.wikimedia.org/wikipedia/commons/8/84/Spotify_icon.svg" className="h-7 w-7 rounded-full" /></a>;
              if (platform === 'apple') return <a key={platform} href={url} target="_blank" className="grid h-7 w-7 place-items-center rounded-full bg-black text-white"></a>;
              if (platform === 'melon') return <a key={platform} href={url} target="_blank" className="grid h-7 w-7 place-items-center rounded-[8px] bg-[#00D344] text-white font-black text-[10px]">M</a>;
              return null;
            })}
          </div>
        </div>

        {/* BOX 2 - DETAILS - SEPARATE BOX */}
        <div className="rounded-2xl border border-[#e0d4ed] bg-white p-6">
          <p className="ps-mono text-[9px] text-[#8068a9]">ALBUM DETAILS</p>
          <div className="mt-4 space-y-3 text-[13px]">
            <div className="flex justify-between border-b border-[#f1e9f9] py-2"><span className="text-[#aa9eac]">Title:</span><span className="font-semibold text-[#332840]">{album.title}</span></div>
            <div className="flex justify-between border-b border-[#f1e9f9] py-2"><span className="text-[#aa9eac]">Type:</span><span className="font-semibold text-[#332840]">{album.type}</span></div>
            <div className="flex justify-between border-b border-[#f1e9f9] py-2"><span className="text-[#aa9eac]">Release date:</span><span className="font-semibold text-[#332840]">{album.date}</span></div>
            <div className="flex justify-between py-2"><span className="text-[#aa9eac]">Tracks:</span><span className="font-semibold text-[#704ca5]">{album.tracks}</span></div>
          </div>
        </div>
      </div>

      {/* BIG BOX - INFO WITH MAGAZINE FEEL */}
      <div className="mt-6 rounded-2xl border border-[#e0d4ed] bg-white p-6 md:p-8">
        <p className="ps-mono text-[9px] text-[#8068a9] mb-4">ABOUT THIS ALBUM</p>
        <p className="text-[15px] leading-7 text-[#40334e]">
          <span className="text-[42px] font-black leading-none mr-2 text-[#704ca5] tracking-tight">{firstWord}</span>
          {restDesc} All information sourced from BIGHIT MUSIC official website, Wikipedia, and album liner notes. This page is for educational and fan reference purposes. Streaming data and credits are verified via Spotify, Apple Music, and Melon official listings. The discography is presented without commercial alteration to celebrate the artists' work.
        </p>
      </div>

      {/* COPYRIGHT BOX */}
      <div className="mt-6 rounded-2xl bg-[#2f2450] p-5 text-white">
        <p className="ps-mono text-[9px] text-[#c0b5d2]">COPYRIGHT NOTICE</p>
        <p className="mt-2 text-[11px] leading-5 text-[#c0b5d2]">All album artworks, music, and trademarks belong to BIGHIT MUSIC / HYBE. This fan-made app PurpleSync is a non-commercial archive created by ARMY for ARMY. No copyright infringement intended. If you are a rights holder and wish to request removal, please contact us. All streaming links redirect to official platforms - Spotify, Apple Music, YouTube Music, and Melon - to support the artists directly.</p>
      </div>
    </div>
  );
}

export function Members() {
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [selectedAlbum, setSelectedAlbum] = useState<any>(null);

  if (selectedAlbum) {
    return <AlbumDetail album={selectedAlbum} member={selectedMember || 'BANGTAN'} onBack={() => setSelectedAlbum(null)} />;
  }

  if (selectedMember) {
    const albums = discographyData[selectedMember] || [];
    return (
      <div className="ps-page-enter ps-content py-8 md:py-12">
        <button onClick={() => setSelectedMember(null)} className="mb-6 flex items-center gap-2 rounded-full border bg-white px-4 py-2 text-[12px]"><ArrowLeft size={14}/> Back to Members</button>
        <p className="ps-mono text-[9px] text-[#8068a9]">DISCOGRAPHY</p>
        <h1 className="ps-display mt-2 text-[42px] text-[#332840]">{selectedMember} <em className="text-[#704ca5]">Archive</em></h1>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {albums.map((al) => <AlbumRow key={al.title} album={al} onOpen={() => setSelectedAlbum(al)} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="ps-page-enter ps-content py-8 md:py-12">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <p className="ps-mono text-[9px] text-[#8068a9]">THE LINEUP</p>
          <h1 className="ps-display mt-2 text-[48px] leading-[.9] tracking-[-.03em] text-[#332840]">Seven voices.<br /><em className="text-[#704ca5]">One signal.</em></h1>
          <p className="mt-5 max-w-[470px] text-[13px] leading-6 text-[#81758d]">A simple reference page for the people at the center of the music, the performances, and the shared history.</p>
        </div>
        <div className="rounded-2xl border border-[#e0d4ed] bg-[#f1e9f9] p-4 md:max-w-[230px]">
          <Music2 size={18} className="text-[#8068a9]" />
          <p className="mt-3 text-[12px] leading-5 text-[#6d5a82]">Different tones, one body of work, and a room large enough for every chapter.</p>
        </div>
      </div>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <article onClick={() => setSelectedMember("BANGTAN")} className="ps-panel ps-panel-hover cursor-pointer rounded-2xl p-5 bg-[#2f2450] text-white border border-[#695887]">
          <div className="flex items-start justify-between"><div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 text-[18px] font-semibold">B</div><span className="ps-mono text-[9px] text-white/60">00</span></div>
          <h2 className="mt-8 text-[18px] font-semibold text-white">BANGTAN</h2><p className="mt-1 ps-mono text-[9px] text-[#c0b5d2]">BTS • GROUP</p><p className="mt-5 min-h-10 text-[12px] leading-5 text-[#c0b5d2]">All group albums without collabs.</p>
          <div className="mt-6 flex items-center justify-between border-t border-white/20 pt-3"><span className="text-[10px] text-white/60">View albums</span><ArrowUpRight size={15} className="text-white" /></div>
        </article>
        {memberItems.map((member, index) => (
          <article key={member.name} onClick={() => setSelectedMember(member.name)} className={`ps-panel ps-panel-hover cursor-pointer rounded-2xl p-5 ${index === memberItems.length - 1 ? 'sm:col-span-2 lg:col-span-1' : ''}`}>
            <div className="flex items-start justify-between"><div className={`flex h-14 w-14 items-center justify-center rounded-2xl text-[18px] font-semibold ${toneClasses[member.tone]}`}>{member.name.slice(0, 1)}</div><span className="ps-mono text-[9px] text-[#aa9eac]">0{index + 1}</span></div>
            <h2 className="mt-8 text-[18px] font-semibold text-[#40334e]">{member.name}</h2><p className="mt-1 ps-mono text-[9px] text-[#8068a9]">{member.role}</p><p className="mt-5 min-h-10 text-[12px] leading-5 text-[#81758d]">{member.detail}</p>
            <div className="mt-6 flex items-center justify-between border-t border-[#eeeaf3] pt-3"><span className="text-[10px] text-[#9b8fa2]">View discography</span><ArrowUpRight size={15} className="text-[#aa8be8]" /></div>
          </article>
        ))}
      </div>
      <div className="mt-12">
        <SectionHeading eyebrow="THE GROUP" title="Together, in motion" action={<span className="ps-mono text-[9px] text-[#aa9eac]">BTS · ARMY</span>} />
        <div className="relative overflow-hidden rounded-2xl bg-[#2f2450] p-6 text-white md:p-8">
          <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full border border-[#695887]" />
          <p className="relative max-w-[660px] ps-display text-[30px] leading-[1.05] md:text-[42px]">“The music gets bigger when everyone has somewhere to stand.”</p>
          <p className="relative mt-5 text-[11px] text-[#c0b5d2]">PurpleSync · a reference desk for staying close</p>
        </div>
      </div>
    </div>
  );
}
