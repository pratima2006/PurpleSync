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

const discographyData: Record<string, any[]> = {
  BANGTAN: [
    { title: "ARIRANG", date: "MAR 20, 2026", tracks: "14 Tracks", type: "5th Studio Album", cover: "https://ibighit.com/public%2FalbumThumbnail%2F1773981474263_0cb62e90f1f0429ba00f98adf42a7aa9.jpg", links: { spotify: "https://open.spotify.com/album/3ukkRHDHbN8tNRPKsGZR1h?si=w97kCaATR9i3wq8e-m2K4A", apple: "https://music.apple.com/us/album/arirang/1868481904", melon: "https://www.melon.com/album/detail.htm?albumId=12927820", ytmusic: "https://music.youtube.com/browse/MPREb_abc" }, desc: "Arirang is a monumental return marking BTS's 13th anniversary. Drawing from Korea's most beloved folk song, the album blends traditional Korean instruments with modern production, exploring themes of identity, reunion, and enduring legacy. Recorded across Seoul and Los Angeles, it features 14 tracks that weave han, heung, and hope into a single narrative." },
    { title: "PERMISSION TO DANCE ON STAGE - LIVE", date: "MAR 20, 2026", tracks: "22 Tracks", type: "1st live album", cover: "https://ibighit.com/public%2FalbumThumbnail%2F2026-01-16_291_discography-cover%2520%2810%29.jpg", links: { spotify: "https://open.spotify.com/album/7xLhqoM0ilHRKUg2irVSDI?si=66e6554b31654209", apple: "https://music.apple.com/in/album/permission-to-dance-on-stage-live/1823627665", melon: "https://www.melon.com/album/detail.htm?albumId=11905250", ytmusic: "#" }, desc: "Permission to Dance On Stage Live captures the electric energy of BTS's world tour." },
    { title: "TAKE TWO", date: "JUN 9, 2025", tracks: "1 Tracks", type: "Digital single", cover: "https://ibighit.com/public/bts/images/bts/discography/take-two/album-cover.png", links: { spotify: "https://open.spotify.com/album/3jeQDa9OFZ6GndLindHx3k?si=fd10ad660232448b", apple: "https://music.apple.com/in/song/take-two/1690421575", melon: "https://www.melon.com/song/detail.htm?songId=36516320" }, desc: "Take Two is a heartfelt fan song celebrating 10 years of BTS and ARMY." },
    { title: "PROOF", date: "JUN 10, 2022", tracks: "48 Tracks", type: " first anthology album", cover: "https://ibighit.com/public%2FalbumThumbnail%2F2026-01-16_364_discography-cover%2520%2835%29.png", links: { spotify: "https://open.spotify.com/album/6al2VdKbb6FIz9d7lU7WRB?si=337ab49e284b4e50", apple: "https://music.apple.com/in/album/proof/1627573936", melon: "https://www.melon.com/album/detail.htm?albumId=10979636" }, desc: "Proof is an anthology that chronicles BTS's journey." },
    { title: "BUTTER & PERMISSION TO DANCE", date: "JUL 9, 2021", tracks: "4 Tracks", type: "Single CD", cover: "https://ibighit.com/public%2FalbumThumbnail%2F2026-01-16_954_butter-2-cover%2520%281%29.jpg", links: { spotify: "https://open.spotify.com/album/0E4HPJE6DPIc2OUmJ8rTP0?si=6150bfa00f094dd9", apple: "https://music.apple.com/in/album/butter-permission-to-dance-ep/1598666015", melon: "https://www.melon.com/album/detail.htm?albumId=10648182" }, desc: "Single CD featuring the global summer hits." },
    { title: "BUTTER", date: "MAY 21, 2021", tracks: "2 Tracks", type: "Digital single", cover: "https://ibighit.com/public%2FalbumThumbnail%2F2026-01-16_229_butter-cover%2520%281%29.jpg", links: { spotify: "https://open.spotify.com/album/0PBQ3Cp6NG8WX0G9KQVNMP?si=s9JxbbJwRJ6_I5glvSUmKg", apple: "https://music.apple.com/in/album/butter-hotter-sweeter-cooler-ep/1598660388", melon: "https://www.melon.com/album/detail.htm?albumId=10612483" }, desc: "Butter is a dance-pop anthem that broke records." },
  ],
  RM: [
    { title: "Right Place, Wrong Person", date: "May 24, 2024", tracks: "11 Tracks", type: "2nd Album", cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400", links: { spotify: "https://open.spotify.com/album/5pSk3cfs4d5F0oS3R0wG6o", apple: "https://music.apple.com/album/1732297281", melon: "https://www.melon.com/album/detail.htm?albumId=11487058", ytmusic: "#" }, desc: "Right Place, Wrong Person explores displacement and self." },
    { title: "Indigo", date: "Dec 2, 2022", tracks: "10 Tracks", type: "1st Album", cover: "https://images.unsplash.com/photo-1496293455970-f8581aae0e3b?w=400", links: { spotify: "#", apple: "#", melon: "#" }, desc: "Indigo is described as an archive of his twenties." },
    { title: "mono.", date: "Oct 23, 2018", tracks: "7 Tracks", type: "Playlist", cover: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400", links: { spotify: "#", apple: "#", melon: "#" }, desc: "Mono is a deeply personal playlist." },
  ],
  Jin: [
    { title: "Echo", date: "May 16, 2025", tracks: "7 Tracks", type: "Mini Album", cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400", links: { spotify: "#", apple: "#", melon: "#" }, desc: "Echo is Jin's second mini album." },
    { title: "Happy", date: "Nov 15, 2024", tracks: "6 Tracks", type: "Mini Album", cover: "https://images.unsplash.com/photo-1496293455970-f8581aae0e3b?w=400", links: { spotify: "#", apple: "#", melon: "#" }, desc: "Happy is Jin's debut solo mini album." },
    { title: "Super Tuna", date: "Dec 4, 2021", tracks: "1 Track", type: "Single", cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400", links: { spotify: "#", apple: "#", melon: "#" }, desc: "Super Tuna is a fun trot-style special single." },
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
    { title: "MUSE", date: "Jul 19, 2024", tracks: "7 Tracks", type: "Album", cover: "https://images.unsplash.com/photo-1496293455970-f8581aae0e3b?w=400", links: { spotify: "#", apple: "#", melon: "#" }, desc: "MUSE is Jimin's second solo album." },
    { title: "FACE", date: "Mar 24, 2023", tracks: "6 Tracks", type: "Album", cover: "https://images.unsplash.com/photo-1496293455970-f8581aae0e3b?w=400", links: { spotify: "#", apple: "#", melon: "#" }, desc: "FACE explores Jimin's inner self." },
    { title: "Promise", date: "Dec 31, 2018", tracks: "1 Track", type: "Single", cover: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400", links: { spotify: "#", apple: "#", melon: "#" }, desc: "First self-composed solo track." },
  ],
  V: [
    { title: "Layover", date: "Sep 8, 2023", tracks: "6 Tracks", type: "Mini Album", cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400", links: { spotify: "#", apple: "#", melon: "#" }, desc: "Layover is V's debut solo album." },
    { title: "FRI(END)S", date: "Mar 15, 2024", tracks: "3 Tracks", type: "Single", cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400", links: { spotify: "#", apple: "#", melon: "#" }, desc: "FRI(END)S is a pop soul single." },
    { title: "Winter Bear", date: "Aug 9, 2019", tracks: "1 Track", type: "Single", cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400", links: { spotify: "#", apple: "#", melon: "#" }, desc: "Winter Bear is a self-directed visual." },
  ],
  Jungkook: [
    { title: "GOLDEN", date: "Nov 3, 2023", tracks: "11 Tracks", type: "Album", cover: "https://images.unsplash.com/photo-1496293455970-f8581aae0e3b?w=400", links: { spotify: "#", apple: "#", melon: "#" }, desc: "GOLDEN is inspired by Jungkook's golden moments." },
    { title: "My You", date: "Jun 13, 2022", tracks: "1 Track", type: "Fan Song", cover: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400", links: { spotify: "#", apple: "#", melon: "#" }, desc: "My You is a fan song dedicated to ARMY." },
    { title: "Still With You", date: "Jul 4, 2020", tracks: "1 Track", type: "Self-Produced", cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400", links: { spotify: "#", apple: "#", melon: "#" }, desc: "Still With You is a self-produced ballad." },
  ],
};

// Icon component - uses your uploaded icons
function StreamIcon({ platform }: { platform: string }) {
  // Yahi 4 icons jo tune bheje the
  const icons: any = {
    spotify: "https://cdn-icons-png.flaticon.com/512/174/174872.png", // black spotify jo tune bheja - same look
    ytmusic: "https://cdn-icons-png.flaticon.com/512/1384/1384060.png", // red YT Music
    apple: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
    melon: "https://cdn-icons-png.flaticon.com/512/5968/5968759.png", // melon green M
  };
  if (platform === 'spotify') return <img src={icons.spotify} className="h-7 w-7 rounded-full bg-black" />;
  if (platform === 'ytmusic' || platform === 'youtube') return <div className="h-7 w-7 rounded-full bg-[#FF0000] grid place-items-center"><span className="text-white text-[10px]">▶</span></div>;
  if (platform === 'apple') return <div className="h-7 w-7 rounded-[8px] bg-gradient-to-br from-[#FA1744] to-[#FB8A3D] grid place-items-center text-white">♪</div>;
  if (platform === 'melon') return <div className="h-7 w-7 rounded-[8px] bg-[#00D344] grid place-items-center text-white font-black text-[10px]">M</div>;
  return null;
}

function AlbumRow({ album, onOpen }: { album: any; onOpen: () => void }) {
  const [coverHover, setCoverHover] = useState(false);
  const validLinks = Object.entries(album.links).filter(([_, url]: any) => url && url !== "#" && url.trim() !== "");

  return (
    <div className="flex flex-col md:flex-row items-start gap-6 md:gap-20 rounded-2xl border border-[#e0d4ed] bg-white p-5 overflow-hidden max-w-full">
      <div 
        className="relative h-[200px] w-[200px] shrink-0 cursor-pointer"
        onMouseEnter={() => setCoverHover(true)}
        onMouseLeave={() => setCoverHover(false)}
        onClick={onOpen}
      >
        {/* DISC - SIRF BIG SCREEN PE - PHONE PE HIDDEN - TILT SAME */}
        <div 
          className="absolute top-1/2 left-1/2 h-[180px] w-[180px] rounded-full bg-[#121212] hidden md:flex items-center justify-center transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
          style={{ 
            boxShadow: '0 0 0 4px #222',
            transform: coverHover ? 'translate(-10%, -50%) rotate(180deg)' : 'translate(-50%, -50%) rotate(0deg) scale(0.9)',
            opacity: coverHover ? 1 : 0
          }}
        >
          <div className="h-full w-full rounded-full flex items-center justify-center" style={{ background: 'repeating-radial-gradient(circle at center, #222 0 2px, #111 2px 4px)', animation: coverHover ? 'spin 3s linear infinite' : 'none' }}>
            <div className="h-7 w-7 rounded-full bg-[#704ca5] border-4 border-black" />
          </div>
        </div>
        <div className="relative z-10 h-full w-full overflow-hidden rounded-xl shadow-md transition-all duration-500" style={{ transform: coverHover ? 'rotate(-4deg) translateY(-4px) scale(1.02)' : 'rotate(0deg)' }}>
          <img src={album.cover} alt={album.title} className="h-full w-full object-cover" />
        </div>
      </div>

      <div className="flex-1 pt-1 min-w-0">
        <p className="ps-mono text-[9px] text-[#aa9eac]">{album.type}</p>
        <h3 className="mt-1 text-[16px] font-bold leading-tight text-[#332840] truncate">{album.title}</h3>
        <div className="mt-2 flex gap-2 flex-wrap">
          <span className="rounded-full bg-[#f1e9f9] px-3 py-1 text-[10px]">{album.date}</span>
          <span className="rounded-full bg-[#eee5f7] px-3 py-1 text-[10px] text-[#704ca5]">{album.tracks}</span>
        </div>
        <div className="mt-4 flex gap-2 flex-wrap">
          {validLinks.map(([platform, url]: any) => (
            <a key={platform} href={url} target="_blank" onClick={e=>e.stopPropagation()} className="hover:scale-110 transition-transform"><StreamIcon platform={platform} /></a>
          ))}
        </div>
      </div>
    </div>
  );
}

function AlbumDetail({ album, member, onBack }: { album: any; member: string; onBack: () => void }) {
  const validLinks = Object.entries(album.links).filter(([_, url]: any) => url && url !== "#" && url.trim() !== "");
  const firstLetter = album.desc.charAt(0);
  const restDesc = album.desc.slice(1);

  return (
    <div className="ps-page-enter ps-content py-6 md:py-10 overflow-x-hidden max-w-full">
      <button onClick={onBack} className="mb-6 flex items-center gap-2 rounded-full border border-[#e0d4ed] bg-white px-4 py-2 text-[12px] text-[#6d5a82] hover:bg-[#f1e9f9]">
        <ArrowLeft size={14}/> Back to {member === 'BANGTAN' ? 'Bangtan' : member}
      </button>

      {/* PHONE PE BHI SIDE BY SIDE - GAP BADHAYA */}
      <div className="grid grid-cols-2 md:grid-cols-[260px_1fr_200px] gap-4 md:gap-6">
        {/* BOX 1 - ALBUM - DISC DELETE KAR DIYA */}
        <div className="rounded-2xl border border-[#e0d4ed] bg-white p-4 flex flex-col items-center">
          <div className="h-[140px] w-[140px] md:h-[220px] md:w-[220px] rounded-xl overflow-hidden shadow-md">
            <img src={album.cover} alt={album.title} className="h-full w-full object-cover" />
          </div>
          <p className="mt-3 text-[11px] font-bold text-[#332840] text-center line-clamp-2">{album.title}</p>
        </div>

        {/* BOX 2 - DETAILS - SEPARATE */}
        <div className="rounded-2xl border border-[#e0d4ed] bg-white p-4">
          <p className="ps-mono text-[8px] text-[#8068a9]">ALBUM DETAILS</p>
          <div className="mt-3 space-y-2 text-[11px] md:text-[12px]">
            <div className="border-b border-[#f1e9f9] pb-1.5"><span className="text-[#aa9eac] block text-[9px]">Title:</span><span className="font-semibold text-[#332840]">{album.title}</span></div>
            <div className="border-b border-[#f1e9f9] pb-1.5"><span className="text-[#aa9eac] block text-[9px]">Type:</span><span className="font-semibold">{album.type}</span></div>
            <div className="border-b border-[#f1e9f9] pb-1.5"><span className="text-[#aa9eac] block text-[9px]">Release date:</span><span className="font-semibold">{album.date}</span></div>
            <div><span className="text-[#aa9eac] block text-[9px]">Tracks:</span><span className="font-semibold text-[#704ca5]">{album.tracks}</span></div>
          </div>
        </div>

        {/* BOX 3 - STREAM - SIRF BIG SCREEN PE */}
        <div className="hidden md:block rounded-2xl border border-[#e0d4ed] bg-white p-4">
          <p className="ps-mono text-[9px] text-[#8068a9]">Stream</p>
          <div className="mt-4 space-y-3">
            {validLinks.map(([platform, url]: any) => (
              <a key={platform} href={url} target="_blank" className="flex items-center gap-3 rounded-full border border-[#f1e9f9] p-2 hover:bg-[#f9f5ff] transition-colors">
                <StreamIcon platform={platform} />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold capitalize">{platform === 'ytmusic' ? 'YouTube Music' : platform}</p>
                  <p className="text-[9px] text-[#aa9eac] truncate">Open in {platform}</p>
                </div>
                <ArrowUpRight size={12} className="text-[#aa9eac]" />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* PHONE PE STREAM ICONS - ALAG LINE ME */}
      <div className="md:hidden mt-4 flex gap-2">
        {validLinks.map(([platform, url]: any) => (
          <a key={platform} href={url} target="_blank" className="flex items-center gap-1.5 rounded-full border bg-white px-3 py-1.5">
            <StreamIcon platform={platform} />
            <span className="text-[10px] capitalize">{platform}</span>
          </a>
        ))}
      </div>

      {/* ABOUT THE ALBUM - FIRST LETTER BIG ONLY */}
      <div className="mt-6 rounded-2xl border border-[#e0d4ed] bg-white p-6 md:p-8">
        <p className="ps-mono text-[9px] text-[#8068a9] mb-4">ABOUT THE ALBUM</p>
        <p className="text-[14px] leading-7 text-[#40334e] first-letter:text-[48px] first-letter:font-black first-letter:text-[#704ca5] first-letter:float-left first-letter:mr-2 first-letter:leading-[0.8]">
          {album.desc} This information is compiled from official BIGHIT MUSIC releases and public Wikipedia entries for fan reference. All tracks should be streamed on official platforms to support the artists.
        </p>
      </div>

      {/* SOURCE & DISCLAIMER BOXES - SAME STYLE AS COPYRIGHT */}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl bg-[#f9f5ff] border border-[#e0d4ed] p-5">
          <p className="ps-mono text-[9px] text-[#8068a9]">SOURCE & DISCLAIMER </p>
          <p className="mt-2 text-[11px] leading-5 text-[#6d5a82]"> All album artworks, music, logos, and trademarks belong to BIGHIT MUSIC / HYBE Labels. PurpleSync is a non-commercial fan-made archive by ARMY for ARMY. No copyright infringement intended. All streaming links redirect to official platforms to support the artists directly.Album covers are low-resolution thumbnails used under fair use for identification.</p>
        </div>
       </div>
      </div>
    </div>
  );
}

export function Members() {
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [selectedAlbum, setSelectedAlbum] = useState<any>(null);
  const [tab, setTab] = useState<'about'|'discography'>('discography');

  if (selectedAlbum) {
    return <AlbumDetail album={selectedAlbum} member={selectedMember || 'BANGTAN'} onBack={() => setSelectedAlbum(null)} />;
  }

  if (selectedMember) {
    const albums = discographyData[selectedMember] || [];
    const isGroup = selectedMember === 'BANGTAN';
    return (
      <div className="ps-page-enter ps-content py-8 md:py-12 overflow-x-hidden">
        <button onClick={() => setSelectedMember(null)} className="mb-6 flex items-center gap-2 rounded-full border bg-white px-4 py-2 text-[12px]"><ArrowLeft size={14}/> Back to Members</button>
        <p className="ps-mono text-[9px] text-[#8068a9]">DISCOGRAPHY</p>
        <h1 className="ps-display mt-2 text-[36px] md:text-[42px] text-[#332840]">{selectedMember} <em className="text-[#704ca5]">Archive</em></h1>
        
        {/* ABOUT / DISCOGRAPHY BUTTONS */}
        <div className="mt-6 flex gap-2">
          <button onClick={() => setTab('about')} className={`rounded-full px-4 py-2 text-[12px] border ${tab === 'about' ? 'bg-[#2f2450] text-white border-[#2f2450]' : 'bg-white border-[#e0d4ed] text-[#6d5a82]'}`}>About</button>
          <button onClick={() => setTab('discography')} className={`rounded-full px-4 py-2 text-[12px] border ${tab === 'discography' ? 'bg-[#704ca5] text-white border-[#704ca5]' : 'bg-white border-[#e0d4ed] text-[#6d5a82]'}`}>Discography</button>
        </div>

        {tab === 'about' ? (
          <div className="mt-8 rounded-2xl border bg-white p-6 md:p-8">
            <p className="text-[14px] leading-7 text-[#40334e] first-letter:text-[56px] first-letter:font-black first-letter:text-[#704ca5] first-letter:float-left first-letter:mr-3 first-letter:leading-[0.8]">
              {isGroup ? "BTS, also known as Bangtan Sonyeondan, debuted on June 13, 2013 under BigHit Entertainment. From their early hip-hop roots in 2 Cool 4 Skool to global phenomenon with Map of the Soul: 7 and beyond, their journey spans over a decade of music that speaks to youth, love, and self-reflection. Their discography includes 9 studio albums in Korean and Japanese, 6 compilation albums, and countless solo projects that showcase each member's unique artistry. From 2013 to 2026, BTS has redefined K-pop's global reach while staying true to their message of self-love and resilience." : `${selectedMember} began their solo journey alongside group activities, exploring personal genres from R&B to hip-hop to ballads. Their discography reflects growth from first mixtapes to official studio albums, each marking a new chapter. Starting from early SoundCloud releases to charting on Billboard, their solo work carries the same authenticity that defines BTS. This archive collects all solo releases without collaborations, presented chronologically to trace artistic evolution.`}
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {albums.map((al) => <AlbumRow key={al.title} album={al} onOpen={() => setSelectedAlbum(al)} />)}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="ps-page-enter ps-content py-8 md:py-12 overflow-x-hidden">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <p className="ps-mono text-[9px] text-[#8068a9]">THE LINEUP</p>
          <h1 className="ps-display mt-2 text-[48px] leading-[.9] tracking-[-.03em] text-[#332840]">Seven voices.<br /><em className="text-[#704ca5]">One signal.</em></h1>
          <p className="mt-5 max-w-[470px] text-[13px] leading-6 text-[#81758d]">A simple reference page for the people at the center of the music.</p>
        </div>
        <div className="rounded-2xl border border-[#e0d4ed] bg-[#f1e9f9] p-4 md:max-w-[230px]">
          <Music2 size={18} className="text-[#8068a9]" />
          <p className="mt-3 text-[12px] leading-5 text-[#6d5a82]">Different tones, one body of work.</p>
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
