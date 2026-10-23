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
    { title: "ARIRANG", date: "MAR 20, 2026", tracks: "14 Tracks", type: "5th Studio Album", cover: "https://ibighit.com/public%2FalbumThumbnail%2F1773981474263_0cb62e90f1f0429ba00f98adf42a7aa9.jpg", links: { spotify: "https://open.spotify.com/album/3ukkRHDHbN8tNRPKsGZR1h?si=w97kCaATR9i3wq8e-m2K4A", apple: "https://music.apple.com/us/album/arirang/1868481904", melon: "https://www.melon.com/album/detail.htm?albumId=12927820" } },
    { title: "PERMISSION TO DANCE ON STAGE - LIVE", date: "MAR 20, 2026", tracks: "22 Tracks", type: "1st live album", cover: "https://ibighit.com/public%2FalbumThumbnail%2F2026-01-16_291_discography-cover%2520%2810%29.jpg", links: { spotify: "https://open.spotify.com/album/7xLhqoM0ilHRKUg2irVSDI?si=66e6554b31654209", apple: "https://music.apple.com/in/album/permission-to-dance-on-stage-live/1823627665", melon: "https://www.melon.com/album/detail.htm?albumId=11905250" } },  
    { title: "TAKE TWO", date: "JUN 9, 2025", tracks: "1 Tracks", type: "Digital single", cover: "https://ibighit.com/public/bts/images/bts/discography/take-two/album-cover.png", links: { spotify: "https://open.spotify.com/album/3jeQDa9OFZ6GndLindHx3k?si=fd10ad660232448b", apple: "https://music.apple.com/in/song/take-two/1690421575", melon: "https://www.melon.com/song/detail.htm?songId=36516320" } },                                                                                                                                                                                                            
    { title: "PROOF", date: "JUN 10, 2022", tracks: "48 Tracks", type: " first anthology album", cover: "https://ibighit.com/public%2FalbumThumbnail%2F2026-01-16_364_discography-cover%2520%2835%29.png", links: { spotify: "https://open.spotify.com/album/6al2VdKbb6FIz9d7lU7WRB?si=337ab49e284b4e50", apple: "https://music.apple.com/in/album/proof/1627573936", melon: "https://www.melon.com/album/detail.htm?albumId=10979636" } },                                                                                                                                                                                                            
    { title: "BUTTER & PERMISSION TO DANCE", date: "JUL 9, 2021", tracks: "4 Tracks", type: "Single CD", cover: "https://ibighit.com/public%2FalbumThumbnail%2F2026-01-16_954_butter-2-cover%2520%281%29.jpg", links: { spotify: "https://open.spotify.com/album/0E4HPJE6DPIc2OUmJ8rTP0?si=6150bfa00f094dd9", apple: "https://music.apple.com/in/album/butter-permission-to-dance-ep/1598666015", melon: "https://www.melon.com/album/detail.htm?albumId=10648182" } },                                                                                                                                                                                                            
    { title: "BUTTER", date: "MAY 21, 2021", tracks: "2 Tracks", type: "Digital single", cover: "https://ibighit.com/public%2FalbumThumbnail%2F2026-01-16_229_butter-cover%2520%281%29.jpg", links: { spotify: "https://open.spotify.com/album/0PBQ3Cp6NG8WX0G9KQVNMP?si=s9JxbbJwRJ6_I5glvSUmKg", apple: "https://music.apple.com/in/album/butter-hotter-sweeter-cooler-ep/1598660388", melon: "https://www.melon.com/album/detail.htm?albumId=10612483" } },                                                                                                                                                                                                            
  ],
  RM: [
    { title: "Right Place, Wrong Person", date: "May 24, 2024", tracks: "11 Tracks", type: "2nd Album", cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400", links: { spotify: "https://open.spotify.com/album/5pSk3cfs4d5F0oS3R0wG6o", youtube: "https://www.youtube.com/watch?v=O0m5N31yGk8", apple: "https://music.apple.com/album/1732297281", melon: "https://www.melon.com/album/detail.htm?albumId=11487058", itunes: "https://music.apple.com/album/1732297281" } },
    { title: "Indigo", date: "Dec 2, 2022", tracks: "10 Tracks", type: "1st Album", cover: "https://images.unsplash.com/photo-1496293455970-f8581aae0e3b?w=400", links: { spotify: "https://open.spotify.com/album/3w4H2OzQ7w2B5Z5Z5Z5Z5Z", youtube: "#", apple: "#", melon: "#", itunes: "#" } },
    { title: "mono.", date: "Oct 23, 2018", tracks: "7 Tracks", type: "Playlist", cover: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400", links: { spotify: "#", youtube: "#", apple: "#", melon: "#", itunes: "#" } },
  ],
  Jin: [
    { title: "Echo", date: "May 16, 2025", tracks: "7 Tracks", type: "Mini Album", cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400", links: { spotify: "#", youtube: "#", apple: "#", melon: "#", itunes: "#" } },
    { title: "Happy", date: "Nov 15, 2024", tracks: "6 Tracks", type: "Mini Album", cover: "https://images.unsplash.com/photo-1496293455970-f8581aae0e3b?w=400", links: { spotify: "#", youtube: "#", apple: "#", melon: "#", itunes: "#" } },
    { title: "Super Tuna", date: "Dec 4, 2021", tracks: "1 Track", type: "Single", cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400", links: { spotify: "#", youtube: "#", apple: "#", melon: "#", itunes: "#" } },
  ],
  Suga: [
    { title: "D-DAY", date: "Apr 21, 2023", tracks: "10 Tracks", type: "Album", cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400", links: { spotify: "#", youtube: "#", apple: "#", melon: "#", itunes: "#" } },
    { title: "Agust D", date: "Aug 15, 2016", tracks: "10 Tracks", type: "Mixtape", cover: "https://images.unsplash.com/photo-1496293455970-f8581aae0e3b?w=400", links: { spotify: "#", youtube: "#", apple: "#", melon: "#", itunes: "#" } },
  ],
  "J-Hope": [
    { title: "HOPE ON THE STREET VOL.1", date: "Mar 29, 2024", tracks: "6 Tracks", type: "Special Album", cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400", links: { spotify: "#", youtube: "#", apple: "#", melon: "#", itunes: "#" } },
    { title: "Jack In The Box", date: "Jul 15, 2022", tracks: "10 Tracks", type: "Album", cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400", links: { spotify: "#", youtube: "#", apple: "#", melon: "#", itunes: "#" } },
    { title: "Killin' It Girl", date: "Jun 13, 2025", tracks: "1 Track", type: "Single", cover: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400", links: { spotify: "#", youtube: "#", apple: "#", melon: "#", itunes: "#" } },
  ],
  Jimin: [
    { title: "MUSE", date: "Jul 19, 2024", tracks: "7 Tracks", type: "Album", cover: "https://images.unsplash.com/photo-1496293455970-f8581aae0e3b?w=400", links: { spotify: "#", youtube: "#", apple: "#", melon: "#", itunes: "#" } },
    { title: "FACE", date: "Mar 24, 2023", tracks: "6 Tracks", type: "Album", cover: "https://images.unsplash.com/photo-1496293455970-f8581aae0e3b?w=400", links: { spotify: "#", youtube: "#", apple: "#", melon: "#", itunes: "#" } },
    { title: "Promise", date: "Dec 31, 2018", tracks: "1 Track", type: "Single", cover: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400", links: { spotify: "#", youtube: "#", apple: "#", melon: "#", itunes: "#" } },
  ],
  V: [
    { title: "Layover", date: "Sep 8, 2023", tracks: "6 Tracks", type: "Mini Album", cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400", links: { spotify: "#", youtube: "#", apple: "#", melon: "#", itunes: "#" } },
    { title: "FRI(END)S", date: "Mar 15, 2024", tracks: "3 Tracks", type: "Single", cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400", links: { spotify: "#", youtube: "#", apple: "#", melon: "#", itunes: "#" } },
    { title: "Winter Bear", date: "Aug 9, 2019", tracks: "1 Track", type: "Single", cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400", links: { spotify: "#", youtube: "#", apple: "#", melon: "#", itunes: "#" } },
  ],
  Jungkook: [
    { title: "GOLDEN", date: "Nov 3, 2023", tracks: "11 Tracks", type: "Album", cover: "https://images.unsplash.com/photo-1496293455970-f8581aae0e3b?w=400", links: { spotify: "#", youtube: "#", apple: "#", melon: "#", itunes: "#" } },
    { title: "My You", date: "Jun 13, 2022", tracks: "1 Track", type: "Fan Song", cover: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400", links: { spotify: "#", youtube: "#", apple: "#", melon: "#", itunes: "#" } },
    { title: "Still With You", date: "Jul 4, 2020", tracks: "1 Track", type: "Self-Produced", cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400", links: { spotify: "#", youtube: "#", apple: "#", melon: "#", itunes: "#" } },
  ],
};

function AlbumRow({ album }: { album: any }) {
  const [coverHover, setCoverHover] = useState(false);

  // Sirf valid links dikhao
  const validLinks = Object.entries(album.links).filter(([_, url]: any) => url && url !== "#" && url.trim() !== "");

  return (
    <div className="flex flex-col md:flex-row items-start gap-6 md:gap-10 rounded-2xl border border-[#e0d4ed] bg-white p-5">
      {/* COVER WRAPPER - SIRF ISPE HOVER */}
      <div 
        className="relative h-[220px] w-[220px] shrink-0 cursor-pointer"
        onMouseEnter={() => setCoverHover(true)}
        onMouseLeave={() => setCoverHover(false)}
        onClick={() => setCoverHover(!coverHover)}
      >
        {/* DISC - THODA SA BAHAR - PEHLE SE ANDAR */}
        <div 
          className="absolute top-1/2 left-1/2 h-[200px] w-[200px] rounded-full bg-[#121212] flex items-center justify-center transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
          style={{ 
            boxShadow: '0 0 0 4px #222',
            transform: coverHover ? 'translate(-15%, -50%) rotate(180deg)' : 'translate(-50%, -50%) rotate(0deg) scale(0.9)',
            opacity: coverHover ? 1 : 0
          }}
        >
          <div className="h-full w-full rounded-full flex items-center justify-center" style={{ background: 'repeating-radial-gradient(circle at center, #222 0 2px, #111 2px 4px)', animation: coverHover ? 'spin 3s linear infinite' : 'none' }}>
            <div className="h-8 w-8 rounded-full bg-[#704ca5] border-4 border-black" />
          </div>
        </div>

        {/* COVER WITH TILT - VIDEO JAISA */}
        <div 
          className="relative z-10 h-full w-full overflow-hidden rounded-xl shadow-md transition-all duration-500 ease-out"
          style={{
            transform: coverHover ? 'rotate(-4deg) translateY(-4px) scale(1.02)' : 'rotate(0deg) translateY(0) scale(1)',
            boxShadow: coverHover ? '0 10px 30px rgba(0,0,0,0.2)' : '0 2px 10px rgba(0,0,0,0.1)'
          }}
        >
          <img src={album.cover} alt={album.title} className="h-full w-full object-cover" />
        </div>
      </div>

      {/* INFO */}
      <div className="flex-1 pt-1">
        <p className="ps-mono text-[9px] text-[#aa9eac]">{album.type}</p>
        <h3 className="mt-1 text-[18px] font-bold leading-tight text-[#332840]">{album.title}</h3>
        <div className="mt-2 flex gap-2 flex-wrap">
          <span className="rounded-full bg-[#f1e9f9] px-3 py-1 text-[10px]">{album.date}</span>
          <span className="rounded-full bg-[#eee5f7] px-3 py-1 text-[10px] text-[#704ca5]">{album.tracks}</span>
        </div>

        {/* REAL ICONS ONLY - JO LINK HAI WAHI DIKHEGA */}
        <div className="mt-5 flex gap-2 flex-wrap">
          {validLinks.map(([platform, url]: any) => {
            if (platform === 'spotify') return (
              <a key={platform} href={url} target="_blank" className="grid h-9 w-9 place-items-center rounded-full bg-[#1DB954] text-white hover:scale-110 transition-transform">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
              </a>
            );
            if (platform === 'youtube') return (
              <a key={platform} href={url} target="_blank" className="grid h-9 w-9 place-items-center rounded-full bg-[#FF0000] text-white hover:scale-110 transition-transform">
                <svg width="18" height="12" viewBox="0 0 24 24" fill="white"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
            );
            if (platform === 'apple') return (
              <a key={platform} href={url} target="_blank" className="grid h-9 w-9 place-items-center rounded-full bg-black text-white hover:scale-110 transition-transform"><span className="text-[16px]"></span></a>
            );
            if (platform === 'itunes') return (
              <a key={platform} href={url} target="_blank" className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-[#FA1744] to-[#FB5A8D] text-white hover:scale-110 transition-transform"><span className="text-[14px] font-bold">♪</span></a>
            );
            if (platform === 'melon') return (
              <a key={platform} href={url} target="_blank" className="grid h-9 w-9 place-items-center rounded-full bg-white border border-[#00D344] text-[#00D344] hover:bg-[#00D344] hover:text-white hover:scale-110 transition-all"><span className="text-[10px] font-black">M</span></a>
            );
            return null;
          })}
        </div>
      </div>
    </div>
  );
}

export function Members() {
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  if (selectedMember) {
    const albums = discographyData[selectedMember] || [];
    return (
      <div className="ps-page-enter ps-content py-8 md:py-12">
        <button onClick={() => setSelectedMember(null)} className="mb-6 flex items-center gap-2 rounded-full border bg-white px-4 py-2 text-[12px]"><ArrowLeft size={14}/> Back to Members</button>
        <p className="ps-mono text-[9px] text-[#8068a9]">DISCOGRAPHY</p>
        <h1 className="ps-display mt-2 text-[42px] text-[#332840]">{selectedMember} <em className="text-[#704ca5]">Archive</em></h1>
        <p className="mt-2 text-[11px] text-[#81758d]">Hover only on cover - disc will pop. Tap on phone.</p>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {albums.map((al) => <AlbumRow key={al.title} album={al} />)}
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
