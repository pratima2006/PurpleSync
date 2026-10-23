import { useState } from 'react';
import { ArrowUpRight, Music2, ArrowLeft, Disc3, ExternalLink } from 'lucide-react';
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

// --- DISCOGRAPHY DATA - RM ke liye full detail, baaki ke liye sample ---
const discographyData: Record<string, any[]> = {
  BANGTAN: [
    { title: "MAP OF THE SOUL: 7", date: "Feb 21, 2020", tracks: "20 Tracks", type: "Album", cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400", links: { spotify: "https://open.spotify.com/album/2KqlAl1Kl5fZmt2vB3X3ji", youtube: "https://www.youtube.com/playlist?list=PL", apple: "#", melon: "#" } },
    { title: "BE", date: "Nov 20, 2020", tracks: "8 Tracks", type: "Album", cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400", links: { spotify: "#", youtube: "#", apple: "#", melon: "#" } },
  ],
  RM: [
    { title: "Right Place, Wrong Person", date: "May 24, 2024", tracks: "11 Tracks", type: "2nd Album • Most personal work", cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400", links: { spotify: "https://open.spotify.com/album/2wJxtM1GeFwlM2tKzScyfk", youtube: "https://www.youtube.com/watch?v=O0m5N31yGk8", apple: "#", melon: "#" } },
    { title: "Indigo", date: "Dec 2, 2022", tracks: "10 Tracks", type: "1st Album • Archive of 20s", cover: "https://images.unsplash.com/photo-1496293455970-f8581aae0e3b?w=400", links: { spotify: "https://open.spotify.com/album/1cH1e5RlM2bD2s6n9J5t7K", youtube: "#", apple: "#", melon: "#" } },
    { title: "mono.", date: "Oct 23, 2018", tracks: "7 Tracks", type: "Playlist • RM's mind", cover: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400", links: { spotify: "#", youtube: "#", apple: "#", melon: "#" } },
  ],
  Jin: [
    { title: "Echo", date: "May 16, 2025", tracks: "7 Tracks", type: "2nd Mini Album", cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400", links: { spotify: "#", youtube: "#", apple: "#", melon: "#" } },
    { title: "Happy", date: "Nov 15, 2024", tracks: "6 Tracks", type: "1st Album", cover: "https://images.unsplash.com/photo-1496293455970-f8581aae0e3b?w=400", links: { spotify: "#", youtube: "#", apple: "#", melon: "#" } },
    { title: "Super Tuna", date: "Dec 4, 2021", tracks: "1 Track", type: "Special Single", cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400", links: { spotify: "#", youtube: "#", apple: "#", melon: "#" } },
  ],
  Suga: [
    { title: "D-DAY", date: "Apr 21, 2023", tracks: "10 Tracks", type: "Album • Final of Trilogy", cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400", links: { spotify: "#", youtube: "#", apple: "#", melon: "#" } },
    { title: "Agust D", date: "Aug 16, 2016", tracks: "10 Tracks", type: "1st Mixtape", cover: "https://images.unsplash.com/photo-1496293455970-f8581aae0e3b?w=400", links: { spotify: "#", youtube: "#", apple: "#", melon: "#" } },
  ],
  "J-Hope": [
    { title: "HOPE ON THE STREET VOL.1", date: "Mar 29, 2024", tracks: "6 Tracks", type: "Special Album", cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400", links: { spotify: "#", youtube: "#", apple: "#", melon: "#" } },
    { title: "Jack In The Box", date: "Jul 15, 2022", tracks: "10 Tracks", type: "1st Album", cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400", links: { spotify: "#", youtube: "#", apple: "#", melon: "#" } },
    { title: "Killin' It Girl", date: "Jun 13, 2025", tracks: "1 Track", type: "Single ft. GloRilla", cover: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400", links: { spotify: "#", youtube: "#", apple: "#", melon: "#" } },
  ],
  Jimin: [
    { title: "MUSE", date: "Jul 19, 2024", tracks: "7 Tracks", type: "2nd Album", cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400", links: { spotify: "#", youtube: "#", apple: "#", melon: "#" } },
    { title: "FACE", date: "Mar 24, 2023", tracks: "6 Tracks", type: "1st Album", cover: "https://images.unsplash.com/photo-1496293455970-f8581aae0e3b?w=400", links: { spotify: "#", youtube: "#", apple: "#", melon: "#" } },
    { title: "Promise", date: "Dec 31, 2018", tracks: "1 Track", type: "First Solo", cover: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400", links: { spotify: "#", youtube: "#", apple: "#", melon: "#" } },
  ],
  V: [
    { title: "Layover", date: "Sep 8, 2023", tracks: "6 Tracks", type: "1st Album", cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400", links: { spotify: "#", youtube: "#", apple: "#", melon: "#" } },
    { title: "FRI(END)S", date: "Mar 15, 2024", tracks: "3 Tracks", type: "Single", cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400", links: { spotify: "#", youtube: "#", apple: "#", melon: "#" } },
    { title: "Winter Bear", date: "Aug 9, 2019", tracks: "1 Track", type: "Self-composed", cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400", links: { spotify: "#", youtube: "#", apple: "#", melon: "#" } },
  ],
  Jungkook: [
    { title: "GOLDEN", date: "Nov 3, 2023", tracks: "11 Tracks", type: "1st Album", cover: "https://images.unsplash.com/photo-1496293455970-f8581aae0e3b?w=400", links: { spotify: "#", youtube: "#", apple: "#", melon: "#" } },
    { title: "My You", date: "Jun 13, 2022", tracks: "1 Track", type: "Fan Song", cover: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400", links: { spotify: "#", youtube: "#", apple: "#", melon: "#" } },
    { title: "Still With You", date: "Jul 4, 2020", tracks: "1 Track", type: "Self-produced", cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400", links: { spotify: "#", youtube: "#", apple: "#", melon: "#" } },
  ],
};

function AlbumRow({ album }: { album: any }) {
  const [hover, setHover] = useState(false);
  return (
    <div 
      className="group relative flex flex-col md:flex-row items-start gap-6 md:gap-12 rounded-2xl border border-[#e0d4ed] bg-white p-4 md:p-6 transition-all hover:border-[#aa8be8]/50 hover:shadow-lg"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onTouchStart={() => setHover(!hover)}
    >
      {/* ALBUM COVER */}
      <div className="relative h-[240px] w-[240px] shrink-0">
        {/* DISC - Right side se niklegi aur ghumegi */}
        <div className={`absolute top-1/2 -right-12 -z-0 h-[220px] w-[220px] -translate-y-1/2 rounded-full bg-[#111] shadow-[0_0_0_6px_#222,0_0_0_12px_#1a1a1a] flex items-center justify-center transition-all duration-700 ease-[cubic-bezier(0.68,-0.55,0.27,1.55)] ${hover ? 'translate-x-[35px] md:translate-x-[60px] rotate-[180deg]' : 'translate-x-0 rotate-0'}`}>
          <div className={`h-full w-full rounded-full bg-[repeating-radial-gradient(circle_at_center,#222_0_2px,#111_2px_3px)] flex items-center justify-center ${hover ? 'animate-[spin_3s_linear_infinite]' : ''}`}>
            <div className="h-10 w-10 rounded-full bg-[#704ca5] border-[5px] border-black" />
          </div>
        </div>
        {/* Cover - upar rahega */}
        <div className={`relative z-10 h-full w-full overflow-hidden rounded-xl bg-[#f1e9f9] shadow-md transition-transform duration-500 ${hover ? 'scale-[0.98] -rotate-1' : ''}`}>
          <img src={album.cover} alt={album.title} className="h-full w-full object-cover" />
        </div>
      </div>

      {/* GAP + INFO - Tune bola beech me gap rakhna hai */}
      <div className="flex-1 md:pl-10 pt-2">
        <p className="ps-mono text-[9px] text-[#aa9eac]">{album.type}</p>
        <h3 className="mt-2 text-[22px] font-bold leading-[1.1] text-[#332840]">{album.title}</h3>
        <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-[#81758d]">
          <span className="rounded-full bg-[#f1e9f9] px-3 py-1">{album.date}</span>
          <span className="rounded-full bg-[#f1e9f9] px-3 py-1">{album.tracks}</span>
        </div>
        <p className="mt-4 text-[12px] leading-5 text-[#6d5a82]">From start till now • All solo works without collabs (for now as example).</p>
        
        {/* STREAMING ICONS - Animation ke saath */}
        <div className="mt-6">
          <p className="ps-mono text-[9px] text-[#8068a9] mb-2">STREAM ON</p>
          <div className="flex gap-2">
            {[
              { name: 'Spotify', key: 'spotify', color: 'hover:bg-[#1DB954] hover:text-white' },
              { name: 'YouTube', key: 'youtube', color: 'hover:bg-red-600 hover:text-white' },
              { name: 'Apple', key: 'apple', color: 'hover:bg-black hover:text-white' },
              { name: 'Melon', key: 'melon', color: 'hover:bg-[#00d344] hover:text-white' },
            ].map((s) => (
              <a key={s.key} href={album.links[s.key]} target="_blank" className={`flex h-9 w-9 items-center justify-center rounded-full border border-[#e0d4ed] bg-white text-[10px] font-bold text-[#6d5a82] transition-all duration-300 hover:scale-110 hover:border-transparent ${s.color} ${hover ? 'animate-[bounce_0.5s_ease]' : ''}`}>
                {s.name === 'Spotify' ? <Music2 size={16}/> : s.name === 'YouTube' ? <ExternalLink size={16}/> : s.name === 'Apple' ? <Disc3 size={16}/> : 'M'}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Members() {
  const [selectedMember, setSelectedMember] = useState<string | null>(null);

  // Agar kisi member pe click hua toh discography dikhao
  if (selectedMember) {
    const albums = discographyData[selectedMember] || [];
    return (
      <div className="ps-page-enter ps-content py-8 md:py-12">
        <button onClick={() => setSelectedMember(null)} className="mb-6 flex items-center gap-2 rounded-full border border-[#e0d4ed] bg-white px-4 py-2 text-[12px] text-[#6d5a82] hover:bg-[#f1e9f9]">
          <ArrowLeft size={14}/> Back to Members
        </button>
        <p className="ps-mono text-[9px] text-[#8068a9]">DISCOGRAPHY</p>
        <h1 className="ps-display mt-2 text-[48px] leading-[.9] tracking-[-.03em] text-[#332840]">
          {selectedMember} <em className="text-[#704ca5]">Archive</em>
        </h1>
        <p className="mt-3 text-[12px] text-[#81758d]">From start till now • Albums side by side on big screen, single line on phone.</p>

        <div className="mt-10 grid gap-8 md:grid-cols-2">
          {albums.map((al) => (
            <AlbumRow key={al.title} album={al} />
          ))}
        </div>
      </div>
    );
  }

  // --- ORIGINAL CODE - Tera wala same to same, bas BANGTAN box add kiya aur click lagaya ---
  return (
    <div className="ps-page-enter ps-content py-8 md:py-12">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <p className="ps-mono text-[9px] text-[#8068a9]">THE LINEUP</p>
          <h1 className="ps-display mt-2 text-[48px] leading-[.9] tracking-[-.03em] text-[#332840]">
            Seven voices.
            <br />
            <em className="text-[#704ca5]">One signal.</em>
          </h1>
          <p className="mt-5 max-w-[470px] text-[13px] leading-6 text-[#81758d]">
            A simple reference page for the people at the center of the
            music, the performances, and the shared history.
          </p>
        </div>
        <div className="rounded-2xl border border-[#e0d4ed] bg-[#f1e9f9] p-4 md:max-w-[230px]">
          <Music2 size={18} className="text-[#8068a9]" />
          <p className="mt-3 text-[12px] leading-5 text-[#6d5a82]">
            Different tones, one body of work, and a room large enough for
            every chapter.
          </p>
        </div>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* BANGTAN BOX - RM se pehle add kiya */}
        <article onClick={() => setSelectedMember("BANGTAN")} className="ps-panel ps-panel-hover cursor-pointer rounded-2xl p-5 bg-gradient-to-br from-[#2f2450] to-[#704ca5] text-white">
          <div className="flex items-start justify-between">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 text-[18px] font-semibold">B</div>
            <span className="ps-mono text-[9px] text-white/60">00</span>
          </div>
          <h2 className="mt-8 text-[18px] font-semibold">BANGTAN</h2>
          <p className="mt-1 ps-mono text-[9px] text-white/70">BTS • GROUP</p>
          <p className="mt-5 min-h-10 text-[12px] leading-5 text-white/80">All group albums without collabs. The full journey together.</p>
          <div className="mt-6 flex items-center justify-between border-t border-white/20 pt-3">
            <span className="text-[10px] text-white/60">Group discography</span>
            <ArrowUpRight size={15} className="text-white" />
          </div>
        </article>

        {memberItems.map((member, index) => (
          <article
            key={member.name}
            onClick={() => setSelectedMember(member.name)}
            className={`ps-panel ps-panel-hover cursor-pointer rounded-2xl p-5 ${
              index === memberItems.length - 1 ? 'sm:col-span-2 lg:col-span-1' : ''
            }`}
          >
            <div className="flex items-start justify-between">
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-2xl text-[18px] font-semibold ${toneClasses[member.tone]}`}
              >
                {member.name.slice(0, 1)}
              </div>
              <span className="ps-mono text-[9px] text-[#aa9eac]">
                0{index + 1}
              </span>
            </div>
            <h2 className="mt-8 text-[18px] font-semibold text-[#40334e]">
              {member.name}
            </h2>
            <p className="mt-1 ps-mono text-[9px] text-[#8068a9]">
              {member.role}
            </p>
            <p className="mt-5 min-h-10 text-[12px] leading-5 text-[#81758d]">
              {member.detail}
            </p>
            <div className="mt-6 flex items-center justify-between border-t border-[#eeeaf3] pt-3">
              <span className="text-[10px] text-[#9b8fa2]">Member note</span>
              <ArrowUpRight size={15} className="text-[#aa8be8]" />
            </div>
          </article>
        ))}
      </div>

      <div className="mt-12">
        <SectionHeading
          eyebrow="THE GROUP"
          title="Together, in motion"
          action={
            <span className="ps-mono text-[9px] text-[#aa9eac]">BTS · ARMY</span>
          }
        />
        <div className="relative overflow-hidden rounded-2xl bg-[#2f2450] p-6 text-white md:p-8">
          <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full border border-[#695887]" />
          <div className="absolute right-12 top-16 h-28 w-28 rounded-full border border-[#695887]" />
          <p className="relative max-w-[660px] ps-display text-[30px] leading-[1.05] md:text-[42px]">
            “The music gets bigger when everyone has somewhere to stand.”
          </p>
          <p className="relative mt-5 text-[11px] text-[#c0b5d2]">
            PurpleSync · a reference desk for staying close
          </p>
        </div>
      </div>
    </div>
  );
}
