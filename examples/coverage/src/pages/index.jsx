import QR from '../components/QR.jsx'
import PageHeader from '../components/PageHeader.jsx'

// ── helper ────────────────────────────────────────────────────────────────────
function Section({ title, note, children }) {
  return (
    <div style={{ marginBottom: '2rem' }}>
      <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>{title}</h2>
      {note && <p style={{ fontSize: '0.8rem', color: 'var(--text-2)', marginBottom: '0.75rem' }}>{note}</p>}
      <div className="demo">{children}</div>
    </div>
  )
}

function Box({ cls = '', style = {}, children }) {
  return <div className={cls} style={{ background: 'var(--accent)', borderRadius: 5, opacity: 0.85, ...style }}>{children}</div>
}

// ── Pages ─────────────────────────────────────────────────────────────────────

const Display = ({ cc }) => (
  <>
    <PageHeader title="Display" desc="Controls the display box type of an element." />
    <QR cc={cc} classes={['block','inline-block','inline','flex','inline-flex','grid','inline-grid','hidden','contents','flow-root','table','table-row','table-cell','list-item']} />
    <Section title="flex">
      <div className="flex gap-4">
        {[1,2,3].map(i => <div key={i} className="w-12 h-12 bg-sky-400 rounded flex items-center justify-center text-white text-sm font-bold">{i}</div>)}
      </div>
    </Section>
    <Section title="grid grid-cols-3">
      <div className="grid grid-cols-3 gap-2">
        {[1,2,3,4,5,6].map(i => <div key={i} className="h-10 bg-sky-400 rounded flex items-center justify-center text-white text-xs">{i}</div>)}
      </div>
    </Section>
  </>
)

const Position = ({ cc }) => (
  <>
    <PageHeader title="Position" desc="Controls how an element is positioned in the document." />
    <QR cc={cc} classes={['static','fixed','absolute','relative','sticky']} />
    <Section title="absolute inside relative">
      <div className="relative w-32 h-20 bg-slate-700 rounded">
        <div className="absolute top-0 right-0 w-6 h-6 bg-sky-400 rounded"></div>
      </div>
    </Section>
  </>
)

const Inset = ({ cc }) => (
  <>
    <PageHeader title="Inset" desc="Controls the placement of positioned elements (top, right, bottom, left)." />
    <QR cc={cc} classes={['top-0','top-2','top-4','right-0','right-4','bottom-0','bottom-4','left-0','left-4','inset-0','inset-4','inset-x-4','inset-y-4','-top-2','-left-2']} />
    <Section title="Positioned elements">
      <div className="relative h-24 w-48 bg-slate-700 rounded">
        {[['top-0 left-0','TL'],['top-0 right-0','TR'],['bottom-0 left-0','BL'],['bottom-0 right-0','BR']].map(([cls,l]) =>
          <div key={l} className={`absolute ${cls} w-8 h-8 bg-sky-400 rounded flex items-center justify-center text-white text-xs`}>{l}</div>
        )}
      </div>
    </Section>
  </>
)

const Visibility = ({ cc }) => (
  <>
    <PageHeader title="Visibility" desc="Controls whether an element is visible without affecting layout." />
    <QR cc={cc} classes={['visible','invisible','collapse']} />
    <Section title="visible vs invisible" note="Both boxes take up space but invisible is hidden.">
      <div className="flex gap-4">
        <div className="visible w-16 h-16 bg-sky-400 rounded flex items-center justify-center text-white text-xs">visible</div>
        <div className="invisible w-16 h-16 bg-sky-400 rounded"></div>
        <div className="w-16 h-16 bg-violet-400 rounded flex items-center justify-center text-white text-xs">after</div>
      </div>
    </Section>
  </>
)

const Overflow = ({ cc }) => (
  <>
    <PageHeader title="Overflow" desc="Controls how content is clipped when it overflows its container." />
    <QR cc={cc} classes={['overflow-auto','overflow-hidden','overflow-visible','overflow-scroll','overflow-x-auto','overflow-x-hidden','overflow-y-auto','overflow-y-hidden','overflow-x-scroll','overflow-y-scroll']} />
    <Section title="overflow-hidden vs overflow-scroll">
      <div className="flex gap-4">
        <div><div className="overflow-hidden w-32 h-16 bg-slate-700 rounded p-2 text-xs text-slate-300">overflow-hidden — this text is clipped when it goes beyond the container boundary</div><div className="label">overflow-hidden</div></div>
        <div><div className="overflow-scroll w-32 h-16 bg-slate-700 rounded p-2 text-xs text-slate-300">overflow-scroll — this text can be scrolled when it goes beyond the container boundary</div><div className="label">overflow-scroll</div></div>
      </div>
    </Section>
  </>
)

const Overscroll = ({ cc }) => (
  <>
    <PageHeader title="Overscroll Behavior" desc="Controls browser behavior when reaching the boundary of a scroll area." />
    <QR cc={cc} classes={['overscroll-auto','overscroll-contain','overscroll-none','overscroll-x-auto','overscroll-x-contain','overscroll-x-none','overscroll-y-auto','overscroll-y-contain','overscroll-y-none']} />
  </>
)

const ZIndex = ({ cc }) => (
  <>
    <PageHeader title="Z-Index" desc="Controls the stack order of a positioned element." />
    <QR cc={cc} classes={['z-0','z-10','z-20','z-30','z-40','z-50','-z-10']} />
    <Section title="Stacking order">
      <div style={{ position: 'relative', height: 80, width: 160 }}>
        {[['z-30 bg-sky-400','30',0,0],['z-20 bg-violet-400','20',20,15],['z-10 bg-emerald-400','10',40,30]].map(([cls,l,x,y]) =>
          <div key={l} className={`absolute ${cls} w-16 h-12 rounded flex items-center justify-center text-white text-xs font-bold`} style={{ left: x, top: y }}>{l}</div>
        )}
      </div>
    </Section>
  </>
)

const Float = ({ cc }) => (
  <>
    <PageHeader title="Float & Clear" desc="Controls floated element placement." />
    <QR cc={cc} classes={['float-left','float-right','float-none','float-start','float-end','clear-left','clear-right','clear-both','clear-none']} />
    <Section title="float-left">
      <div style={{ overflow: 'hidden' }}>
        <div className="float-left w-16 h-16 bg-sky-400 rounded mr-3"></div>
        <p className="text-sm text-slate-300">This text wraps around the floated element using float-left. The cyan box floats to the left and the text fills the available space beside it.</p>
      </div>
    </Section>
  </>
)

const Isolation = ({ cc }) => (
  <>
    <PageHeader title="Isolation" desc="Controls whether an element creates a new stacking context." />
    <QR cc={cc} classes={['isolate','isolation-auto']} />
    <Section title="isolate vs isolation-auto">
      <div className="flex gap-4">
        <div className="isolate w-20 h-20 bg-sky-400 rounded flex items-center justify-center text-white text-xs font-bold">isolate</div>
        <div className="isolation-auto w-20 h-20 bg-violet-400 rounded flex items-center justify-center text-white text-xs font-bold">auto</div>
      </div>
    </Section>
  </>
)

const ObjectFit = ({ cc }) => (
  <>
    <PageHeader title="Object Fit" desc="Controls how a replaced element's content fills its container." />
    <QR cc={cc} classes={['object-contain','object-cover','object-fill','object-none','object-scale-down']} />
    <Section title="Object fit comparison">
      <div className="flex gap-3 flex-wrap">
        {['object-contain','object-cover','object-fill','object-none','object-scale-down'].map(cls => (
          <div key={cls} className="demo-col">
            <div className="w-24 h-20 bg-slate-700 rounded overflow-hidden">
              <img src="https://picsum.photos/seed/wr/200/150" className={cls} style={{ width: '100%', height: '100%' }} />
            </div>
            <div className="label">{cls.replace('object-','')}</div>
          </div>
        ))}
      </div>
    </Section>
  </>
)

const ObjectPosition = ({ cc }) => (
  <>
    <PageHeader title="Object Position" desc="Controls the position of a replaced element's content within its container." />
    <QR cc={cc} classes={['object-center','object-top','object-bottom','object-left','object-right','object-left-top','object-left-bottom','object-right-top','object-right-bottom']} />
    <Section title="Object position comparison" note="All images use object-cover with different position values.">
      <div className="flex gap-3 flex-wrap">
        {['object-center','object-top','object-bottom','object-left','object-right'].map(cls => (
          <div key={cls} className="demo-col">
            <div className="w-20 h-16 bg-slate-700 rounded overflow-hidden">
              <img src="https://picsum.photos/seed/face/300/300" className={`object-cover ${cls}`} style={{ width: '100%', height: '100%' }} />
            </div>
            <div className="label">{cls.replace('object-','')}</div>
          </div>
        ))}
      </div>
    </Section>
  </>
)

const AspectRatio = ({ cc }) => (
  <>
    <PageHeader title="Aspect Ratio" desc="Controls the aspect ratio of an element." />
    <QR cc={cc} classes={['aspect-auto','aspect-square','aspect-video','aspect-[4/3]']} />
    <Section title="Aspect ratio examples">
      <div className="flex gap-4 items-end">
        {[['aspect-square','1:1','sky'],['aspect-video','16:9','violet']].map(([cls,l,c]) => (
          <div key={cls} className="demo-col">
            <div className={`w-32 ${cls} bg-${c}-400 rounded flex items-center justify-center text-white text-xs font-bold`}>{l}</div>
            <div className="label">{cls}</div>
          </div>
        ))}
      </div>
    </Section>
  </>
)

const Columns = ({ cc }) => (
  <>
    <PageHeader title="Columns" desc="Controls the number of columns in a multi-column layout." />
    <QR cc={cc} classes={['columns-1','columns-2','columns-3','columns-4','columns-auto']} />
    <Section title="columns-3">
      <div className="columns-3 gap-4">
        {[1,2,3,4,5,6].map(i => <div key={i} className="bg-sky-400 rounded p-2 mb-2 text-xs text-white font-bold break-inside-avoid">Item {i}</div>)}
      </div>
    </Section>
  </>
)

const BoxSizing = ({ cc }) => (
  <>
    <PageHeader title="Box Sizing" desc="Controls how the browser calculates an element's total size." />
    <QR cc={cc} classes={['box-border','box-content']} />
    <Section title="box-border vs box-content" note="Both have w-40 and p-4. box-border includes padding in width; box-content adds to it.">
      <div className="flex gap-4">
        <div className="box-border w-40 p-4 bg-sky-400/20 border-2 border-sky-400 rounded text-xs text-sky-300">box-border (padding inside)</div>
        <div className="box-content w-40 p-4 bg-violet-400/20 border-2 border-violet-400 rounded text-xs text-violet-300">box-content (padding outside)</div>
      </div>
    </Section>
  </>
)

const Break = ({ cc }) => (
  <>
    <PageHeader title="Break After / Before / Inside" desc="Controls column and page break behavior." />
    <QR cc={cc} classes={['break-after-auto','break-after-all','break-after-avoid','break-after-page','break-before-auto','break-inside-auto','break-inside-avoid','break-inside-avoid-column','box-decoration-break-clone','box-decoration-break-slice']} />
    <Section title="break-inside-avoid in columns">
      <div className="columns-3 gap-4">
        {[1,2,3,4,5,6].map(i => <div key={i} className="break-inside-avoid bg-sky-400/20 border border-sky-400 rounded p-2 mb-3 text-xs text-sky-300">Item {i} — content that might break across columns</div>)}
      </div>
    </Section>
  </>
)

const Preflight = ({ cc }) => (
  <>
    <PageHeader title="Preflight" desc="A set of base styles that normalize browser defaults. Injected automatically when windrunner starts." />
    <QR cc={cc} classes={['block','m-0','p-0','border-0']} />
    <Section title="What Preflight does">
      <div style={{ display: 'grid', gap: '0.6rem', fontSize: '0.85rem' }}>
        {['box-sizing: border-box on all elements','Margins reset to 0 on headings, body, paragraphs','Default list styles removed from ul and ol','Images set to display:block; max-width:100%','Form elements inherit font from parent','Borders default to 0 solid'].map(t => (
          <div key={t} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-sky-400 shrink-0"></span>
            <span className="text-slate-300 text-xs">{t}</span>
          </div>
        ))}
      </div>
    </Section>
  </>
)

// ── Spacing ───────────────────────────────────────────────────────────────────
const Padding = ({ cc }) => (
  <>
    <PageHeader title="Padding" desc="Controls the padding area around an element's content." />
    <QR cc={cc} classes={['p-0','p-1','p-2','p-4','p-6','p-8','px-4','py-4','pt-4','pr-4','pb-4','pl-4','p-px']} />
    <Section title="Padding scale">
      <div className="flex gap-3 flex-wrap">
        {['p-1','p-2','p-4','p-6','p-8'].map(cls => (
          <div key={cls} className="demo-col">
            <div className={`${cls} bg-sky-400/20 border border-sky-400 rounded`}>
              <div className="w-6 h-6 bg-sky-400 rounded"></div>
            </div>
            <div className="label">{cls}</div>
          </div>
        ))}
      </div>
    </Section>
  </>
)

const Margin = ({ cc }) => (
  <>
    <PageHeader title="Margin" desc="Controls the margin area outside an element." />
    <QR cc={cc} classes={['m-0','m-1','m-2','m-4','m-6','m-8','mx-4','my-4','mt-4','mr-4','mb-4','ml-4','m-auto','mx-auto','-m-2','-mt-2']} />
    <Section title="mx-auto — centering" note="Block element centered with mx-auto.">
      <div className="bg-slate-700 rounded p-2">
        <div className="mx-auto w-32 h-10 bg-sky-400 rounded flex items-center justify-center text-white text-xs">mx-auto</div>
      </div>
    </Section>
  </>
)

const SpaceBetween = ({ cc }) => (
  <>
    <PageHeader title="Space Between" desc="Adds space between child elements using > :not(:first-child) selector." />
    <QR cc={cc} classes={['space-x-1','space-x-2','space-x-4','space-x-8','space-y-1','space-y-2','space-y-4','space-y-8','space-x-reverse','space-y-reverse']} />
    <Section title="space-x-4 (horizontal)">
      <div className="flex space-x-4">
        {[1,2,3].map(i => <div key={i} className="w-12 h-12 bg-sky-400 rounded flex items-center justify-center text-white text-sm">{i}</div>)}
      </div>
    </Section>
    <Section title="space-y-4 (vertical)">
      <div className="flex flex-col space-y-4">
        {[1,2,3].map(i => <div key={i} className="w-32 h-10 bg-violet-400 rounded flex items-center justify-center text-white text-sm">{i}</div>)}
      </div>
    </Section>
  </>
)

// ── Sizing ────────────────────────────────────────────────────────────────────
const Width = ({ cc }) => (
  <>
    <PageHeader title="Width" desc="Controls the width of an element." />
    <QR cc={cc} classes={['w-0','w-px','w-1','w-4','w-8','w-16','w-32','w-64','w-auto','w-full','w-screen','w-fit','w-min','w-max','w-1/2','w-1/3','w-2/3','w-1/4','w-3/4','w-[200px]','w-[50%]']} />
    <Section title="Width scale">
      <div style={{ width: '100%' }}>
        {['w-full','w-3/4','w-1/2','w-1/4','w-32','w-16','w-8'].map(cls => (
          <div key={cls} style={{ marginBottom: 6 }}>
            <div className={`${cls} h-5 bg-sky-400 rounded`} style={{ maxWidth: '100%' }}></div>
            <div className="label" style={{ textAlign: 'left' }}>{cls}</div>
          </div>
        ))}
      </div>
    </Section>
  </>
)

const Height = ({ cc }) => (
  <>
    <PageHeader title="Height" desc="Controls the height of an element." />
    <QR cc={cc} classes={['h-0','h-px','h-1','h-4','h-8','h-16','h-32','h-64','h-auto','h-full','h-fit','h-min','h-max','h-[100px]']} />
    <Section title="Height scale">
      <div className="flex items-end gap-3">
        {['h-4','h-8','h-16','h-24','h-32'].map(cls => (
          <div key={cls} className="demo-col">
            <div className={`w-8 ${cls} bg-sky-400 rounded`}></div>
            <div className="label">{cls}</div>
          </div>
        ))}
      </div>
    </Section>
  </>
)

const Size = ({ cc }) => (
  <>
    <PageHeader title="Size" desc="Sets both width and height simultaneously." />
    <QR cc={cc} classes={['size-4','size-8','size-12','size-16','size-24','size-32','size-full','size-auto','size-[50px]']} />
    <Section title="Size scale">
      <div className="flex items-end gap-3">
        {['size-4','size-8','size-12','size-16','size-24'].map(cls => (
          <div key={cls} className="demo-col">
            <div className={`${cls} bg-sky-400 rounded`}></div>
            <div className="label">{cls}</div>
          </div>
        ))}
      </div>
    </Section>
  </>
)

const MinWidth = ({ cc }) => (
  <>
    <PageHeader title="Min-Width" desc="Sets the minimum width of an element." />
    <QR cc={cc} classes={['min-w-0','min-w-4','min-w-8','min-w-16','min-w-full','min-w-min','min-w-max','min-w-fit','min-w-[100px]']} />
  </>
)

const MaxWidth = ({ cc }) => (
  <>
    <PageHeader title="Max-Width" desc="Sets the maximum width of an element." />
    <QR cc={cc} classes={['max-w-xs','max-w-sm','max-w-md','max-w-lg','max-w-xl','max-w-2xl','max-w-full','max-w-none','max-w-prose']} />
    <Section title="max-w-sm">
      <div className="max-w-sm bg-sky-400/20 border border-sky-400 rounded p-3 text-sm text-sky-200">This box uses max-w-sm and won't grow beyond 24rem.</div>
    </Section>
    <Section title="max-w-prose" note="Optimal ~65ch line length for reading.">
      <div className="max-w-prose bg-violet-400/20 border border-violet-400 rounded p-3 text-sm text-violet-200">max-w-prose sets a comfortable reading width of 65ch, keeping long paragraphs legible without pixel values.</div>
    </Section>
  </>
)

const MinHeight = ({ cc }) => (
  <>
    <PageHeader title="Min-Height" desc="Sets the minimum height of an element." />
    <QR cc={cc} classes={['min-h-0','min-h-4','min-h-8','min-h-16','min-h-full','min-h-screen','min-h-min','min-h-max','min-h-fit','min-h-[80px]']} />
    <Section title="min-h-16" note="Box always at least 4rem tall even with little content.">
      <div className="min-h-16 w-48 bg-sky-400/20 border border-sky-400 rounded p-2 text-xs text-sky-300">short content</div>
    </Section>
  </>
)

const MaxHeight = ({ cc }) => (
  <>
    <PageHeader title="Max-Height" desc="Sets the maximum height of an element." />
    <QR cc={cc} classes={['max-h-0','max-h-4','max-h-8','max-h-32','max-h-64','max-h-full','max-h-screen','max-h-none','max-h-[120px]']} />
    <Section title="max-h-32 with overflow-y-auto" note="Scrollable container capped at max height.">
      <div className="max-h-32 overflow-y-auto bg-sky-400/10 border border-sky-400 rounded p-3 text-sm text-sky-200">
        {[...Array(10)].map((_,i) => <p key={i}>Line {i+1} — content here</p>)}
      </div>
    </Section>
  </>
)

// ── Typography ────────────────────────────────────────────────────────────────
const FontFamily = ({ cc }) => (
  <>
    <PageHeader title="Font Family" desc="Sets the font family of text." />
    <QR cc={cc} classes={['font-sans','font-serif','font-mono']} />
    <Section title="Font families">
      {['font-sans','font-serif','font-mono'].map(cls => (
        <div key={cls} className={`${cls} text-base text-sky-300 mb-2`}>The quick brown fox — <span className="text-slate-400 text-xs">{cls}</span></div>
      ))}
    </Section>
  </>
)

const FontSize = ({ cc }) => (
  <>
    <PageHeader title="Font Size" desc="Controls the font size of text." />
    <QR cc={cc} classes={['text-xs','text-sm','text-base','text-lg','text-xl','text-2xl','text-3xl','text-4xl','text-5xl']} />
    <Section title="Font size scale">
      {['text-xs','text-sm','text-base','text-lg','text-xl','text-2xl','text-3xl'].map(cls => (
        <div key={cls} className={`${cls} text-sky-300 mb-1`}>Windrunner <span className="text-slate-500 text-xs">{cls}</span></div>
      ))}
    </Section>
  </>
)

const FontSmoothing = ({ cc }) => (
  <>
    <PageHeader title="Font Smoothing" desc="Controls anti-aliasing of text." />
    <QR cc={cc} classes={['antialiased','subpixel-antialiased']} />
    <Section title="Comparison">
      <p className="antialiased text-base text-sky-300 mb-2">antialiased — The quick brown fox</p>
      <p className="subpixel-antialiased text-base text-sky-300">subpixel-antialiased — The quick brown fox</p>
    </Section>
  </>
)

const FontStyle = ({ cc }) => (
  <>
    <PageHeader title="Font Style" desc="Controls whether text is italicised." />
    <QR cc={cc} classes={['italic','not-italic']} />
    <Section title="Comparison">
      <p className="italic text-base text-sky-300 mb-2">italic — The quick brown fox</p>
      <p className="not-italic text-base text-sky-300">not-italic — The quick brown fox</p>
    </Section>
  </>
)

const FontWeight = ({ cc }) => (
  <>
    <PageHeader title="Font Weight" desc="Controls the weight (boldness) of text." />
    <QR cc={cc} classes={['font-thin','font-extralight','font-light','font-normal','font-medium','font-semibold','font-bold','font-extrabold','font-black']} />
    <Section title="Font weight scale">
      {['font-thin','font-light','font-normal','font-medium','font-semibold','font-bold','font-extrabold','font-black'].map(cls => (
        <div key={cls} className={`${cls} text-base text-sky-300 mb-1`}>Windrunner <span className="text-slate-500 font-normal text-xs">{cls}</span></div>
      ))}
    </Section>
  </>
)

const LetterSpacing = ({ cc }) => (
  <>
    <PageHeader title="Letter Spacing" desc="Controls the tracking (letter spacing) of text." />
    <QR cc={cc} classes={['tracking-tighter','tracking-tight','tracking-normal','tracking-wide','tracking-wider','tracking-widest']} />
    <Section title="Letter spacing scale">
      {['tracking-tighter','tracking-tight','tracking-normal','tracking-wide','tracking-wider','tracking-widest'].map(cls => (
        <div key={cls} className={`${cls} text-base text-sky-300 mb-2`}>Windrunner <span className="text-slate-500 tracking-normal text-xs">{cls}</span></div>
      ))}
    </Section>
  </>
)

const LineHeight = ({ cc }) => (
  <>
    <PageHeader title="Line Height" desc="Controls the leading (line height) of text." />
    <QR cc={cc} classes={['leading-none','leading-tight','leading-snug','leading-normal','leading-relaxed','leading-loose','leading-3','leading-4','leading-5','leading-6']} />
    <Section title="Line height comparison">
      <div className="flex gap-4 flex-wrap">
        {['leading-none','leading-tight','leading-normal','leading-relaxed','leading-loose'].map(cls => (
          <div key={cls} style={{ maxWidth: 140 }}>
            <p className={`${cls} text-sm text-sky-200`}>The quick brown fox jumps over the lazy dog.</p>
            <div className="label" style={{ textAlign: 'left' }}>{cls}</div>
          </div>
        ))}
      </div>
    </Section>
  </>
)

const LineClamp = ({ cc }) => (
  <>
    <PageHeader title="Line Clamp" desc="Clamps text to a fixed number of lines with an ellipsis." />
    <QR cc={cc} classes={['line-clamp-1','line-clamp-2','line-clamp-3','line-clamp-4','line-clamp-none']} />
    <Section title="Line clamp examples">
      {['line-clamp-1','line-clamp-2','line-clamp-3'].map(cls => (
        <div key={cls} style={{ maxWidth: 300, marginBottom: 12 }}>
          <p className={`${cls} text-sm text-sky-200`}>Lorem ipsum dolor sit amet consectetur adipisicing elit. Deserunt similique quae hic dicta quo facere facilis praesentium a sunt, est quia pariatur.</p>
          <div className="label" style={{ textAlign: 'left' }}>{cls}</div>
        </div>
      ))}
    </Section>
  </>
)

const TextAlign = ({ cc }) => (
  <>
    <PageHeader title="Text Align" desc="Controls the alignment of text." />
    <QR cc={cc} classes={['text-left','text-center','text-right','text-justify','text-start','text-end']} />
    <Section title="Text alignment">
      {['text-left','text-center','text-right','text-justify'].map(cls => (
        <div key={cls} style={{ maxWidth: 280, marginBottom: 12, background: 'var(--bg3)', borderRadius: 6, padding: '0.5rem 0.75rem' }}>
          <p className={`${cls} text-sm text-sky-200`}>The quick brown fox jumps over the lazy dog.</p>
          <div className="label" style={{ textAlign: 'left' }}>{cls}</div>
        </div>
      ))}
    </Section>
  </>
)

const TextColor = ({ cc }) => {
  const colors = ['text-slate-400','text-red-400','text-orange-400','text-yellow-400','text-lime-400','text-green-400','text-teal-400','text-sky-400','text-blue-400','text-violet-400','text-pink-400','text-rose-400','text-white','text-black','text-sky-400/75','text-sky-400/50']
  return (
    <>
      <PageHeader title="Text Color" desc="Controls the text color." />
      <QR cc={cc} classes={colors} />
      <Section title="Color palette">
        <div className="flex flex-wrap gap-3">
          {colors.map(cls => (
            <div key={cls} className="demo-col">
              <span className={`${cls} text-lg font-bold`}>Aa</span>
              <div className="label">{cls.replace('text-','')}</div>
            </div>
          ))}
        </div>
      </Section>
    </>
  )
}

const TextDecoration = ({ cc }) => (
  <>
    <PageHeader title="Text Decoration" desc="Controls text decoration lines, styles, colors and thickness." />
    <QR cc={cc} classes={['underline','overline','line-through','no-underline','decoration-solid','decoration-dashed','decoration-dotted','decoration-double','decoration-wavy','decoration-1','decoration-2','decoration-4','decoration-sky-400','decoration-red-400']} />
    <Section title="Decoration lines">
      {['underline','overline','line-through','no-underline'].map(cls => <p key={cls} className={`${cls} text-sm text-sky-200 mb-2`}>{cls} — The quick brown fox</p>)}
    </Section>
    <Section title="Decoration styles (with underline)">
      {['decoration-solid','decoration-dashed','decoration-dotted','decoration-double','decoration-wavy'].map(cls => <p key={cls} className={`underline ${cls} text-sm text-sky-200 mb-2`}>{cls}</p>)}
    </Section>
  </>
)

const TextTransform = ({ cc }) => (
  <>
    <PageHeader title="Text Transform" desc="Controls the capitalization of text." />
    <QR cc={cc} classes={['uppercase','lowercase','capitalize','normal-case']} />
    <Section title="Text transform examples">
      {['uppercase','lowercase','capitalize','normal-case'].map(cls => (
        <div key={cls} className="mb-2">
          <span className={`${cls} text-base text-sky-300`}>Hello World from Windrunner</span>
          <span className="text-slate-500 text-xs ml-2">{cls}</span>
        </div>
      ))}
    </Section>
  </>
)

const TextOverflow = ({ cc }) => (
  <>
    <PageHeader title="Text Overflow" desc="Controls how overflowed text is represented." />
    <QR cc={cc} classes={['truncate','overflow-ellipsis','overflow-clip','text-ellipsis','text-clip']} />
    <Section title="truncate" note="Clips text with ellipsis, also sets overflow:hidden and whitespace:nowrap.">
      <div className="truncate text-sky-200 text-sm bg-sky-400/10 rounded p-2" style={{ maxWidth: 260 }}>
        The quick brown fox jumps over the lazy dog — this is a very long sentence that should be truncated
      </div>
    </Section>
  </>
)

const TextWrap = ({ cc }) => (
  <>
    <PageHeader title="Text Wrap" desc="Controls how text wraps within an element." />
    <QR cc={cc} classes={['text-wrap','text-nowrap','text-balance','text-pretty']} />
    <Section title="Text wrap modes">
      <div className="flex gap-3 flex-wrap">
        {['text-wrap','text-nowrap','text-balance'].map(cls => (
          <div key={cls} style={{ maxWidth: 200, background: 'var(--bg3)', borderRadius: 6, padding: '0.5rem 0.75rem' }}>
            <p className={`${cls} text-sm text-sky-200`}>The quick brown fox jumps over the lazy dog.</p>
            <div className="label" style={{ textAlign: 'left' }}>{cls}</div>
          </div>
        ))}
      </div>
    </Section>
  </>
)

const Whitespace = ({ cc }) => (
  <>
    <PageHeader title="Whitespace" desc="Controls how whitespace is handled in text." />
    <QR cc={cc} classes={['whitespace-normal','whitespace-nowrap','whitespace-pre','whitespace-pre-line','whitespace-pre-wrap','whitespace-break-spaces']} />
    <Section title="Whitespace handling">
      {['whitespace-normal','whitespace-nowrap','whitespace-pre'].map(cls => (
        <div key={cls} style={{ maxWidth: 240, marginBottom: 8, overflow: 'hidden' }}>
          <div className={`${cls} text-sm text-sky-200 bg-sky-400/10 rounded p-2`}>{'Hello    World\n  indented line'}</div>
          <div className="label" style={{ textAlign: 'left' }}>{cls}</div>
        </div>
      ))}
    </Section>
  </>
)

const WordBreak = ({ cc }) => (
  <>
    <PageHeader title="Word Break" desc="Controls word break behavior for text." />
    <QR cc={cc} classes={['break-normal','break-words','break-all','break-keep']} />
    <Section title="Word break" note="All containers have the same fixed width.">
      <div className="flex gap-3">
        {['break-normal','break-words','break-all'].map(cls => (
          <div key={cls} style={{ width: 120 }}>
            <div className={`${cls} text-sm text-sky-200 bg-sky-400/10 rounded p-2`}>Thisisaverylongword</div>
            <div className="label" style={{ textAlign: 'left' }}>{cls}</div>
          </div>
        ))}
      </div>
    </Section>
  </>
)

const VerticalAlign = ({ cc }) => (
  <>
    <PageHeader title="Vertical Align" desc="Controls the vertical alignment of inline or table-cell elements." />
    <QR cc={cc} classes={['align-baseline','align-top','align-middle','align-bottom','align-text-top','align-text-bottom','align-sub','align-super']} />
    <Section title="Vertical align">
      <div style={{ lineHeight: '2.5rem' }}>
        {['align-baseline','align-top','align-middle','align-bottom','align-super','align-sub'].map(cls => (
          <span key={cls} className="mr-6">
            <span style={{ fontSize: '2rem', lineHeight: 1 }}>A</span>
            <span className={`${cls} text-xs text-sky-400 bg-sky-400/20 rounded px-1`}>{cls.replace('align-','')}</span>
          </span>
        ))}
      </div>
    </Section>
  </>
)

// ── Flexbox & Grid ────────────────────────────────────────────────────────────
const boxes = (n, c='sky') => [...Array(n)].map((_,i) => <div key={i} className={`w-10 h-10 bg-${c}-400 rounded flex items-center justify-center text-white text-xs`}>{i+1}</div>)

const FlexBasis = ({ cc }) => (
  <>
    <PageHeader title="Flex Basis" desc="Controls the initial size of a flex item." />
    <QR cc={cc} classes={['basis-0','basis-1','basis-4','basis-8','basis-16','basis-32','basis-auto','basis-full','basis-1/2','basis-1/3','basis-1/4']} />
    <Section title="basis-1/3 items">
      <div className="flex gap-2">
        {[1,2,3].map(i => <div key={i} className="basis-1/3 h-10 bg-sky-400 rounded flex items-center justify-center text-white text-xs">1/3</div>)}
      </div>
    </Section>
  </>
)

const FlexDirection = ({ cc }) => (
  <>
    <PageHeader title="Flex Direction" desc="Controls the direction of flex items." />
    <QR cc={cc} classes={['flex-row','flex-row-reverse','flex-col','flex-col-reverse']} />
    <Section title="flex-row vs flex-col">
      <div className="flex gap-6 flex-wrap">
        {[['flex-row','row'],['flex-col','col']].map(([cls,l]) => (
          <div key={cls} className="demo-col">
            <div className={`flex ${cls} gap-2`}>{boxes(3)}</div>
            <div className="label">{cls}</div>
          </div>
        ))}
      </div>
    </Section>
  </>
)

const FlexWrap = ({ cc }) => (
  <>
    <PageHeader title="Flex Wrap" desc="Controls whether flex items wrap." />
    <QR cc={cc} classes={['flex-wrap','flex-nowrap','flex-wrap-reverse']} />
    <Section title="flex-wrap vs flex-nowrap" note="Container is 200px wide with 8 items.">
      <div className="flex gap-4 flex-wrap">
        {[['flex-wrap','wrap'],['flex-nowrap','nowrap']].map(([cls,l]) => (
          <div key={cls} className="demo-col">
            <div className={`flex ${cls} gap-1`} style={{ width: 200 }}>{[...Array(6)].map((_,i) => <div key={i} className="w-10 h-8 bg-sky-400 rounded flex items-center justify-center text-white text-xs">{i+1}</div>)}</div>
            <div className="label">{cls}</div>
          </div>
        ))}
      </div>
    </Section>
  </>
)

const Flex = ({ cc }) => (
  <>
    <PageHeader title="Flex" desc="Controls how flex items grow and shrink." />
    <QR cc={cc} classes={['flex-1','flex-auto','flex-initial','flex-none']} />
    <Section title="flex-1 vs flex-none">
      <div className="flex gap-2" style={{ width: '100%' }}>
        <div className="flex-1 h-10 bg-sky-400 rounded flex items-center justify-center text-white text-xs">flex-1</div>
        <div className="flex-1 h-10 bg-sky-400 rounded flex items-center justify-center text-white text-xs">flex-1</div>
        <div className="flex-none h-10 bg-violet-400 rounded px-3 flex items-center text-white text-xs">flex-none</div>
      </div>
    </Section>
  </>
)

const FlexGrow = ({ cc }) => (
  <>
    <PageHeader title="Flex Grow / Shrink" desc="Controls how flex items grow and shrink relative to siblings." />
    <QR cc={cc} classes={['grow','grow-0','shrink','shrink-0']} />
    <Section title="grow vs grow-0">
      <div className="flex gap-2" style={{ width: '100%' }}>
        <div className="grow h-10 bg-sky-400 rounded flex items-center justify-center text-white text-xs">grow</div>
        <div className="grow-0 h-10 bg-violet-400 rounded px-3 flex items-center text-white text-xs">grow-0</div>
      </div>
    </Section>
  </>
)

const Order = ({ cc }) => (
  <>
    <PageHeader title="Order" desc="Controls the visual order of flex/grid items." />
    <QR cc={cc} classes={['order-1','order-2','order-3','order-first','order-last','order-none']} />
    <Section title="Reordered items" note="DOM order: 1,2,3 — visual order via order classes: 3,1,2">
      <div className="flex gap-2">
        <div className="order-2 w-12 h-12 bg-sky-400 rounded flex items-center justify-center text-white font-bold">1</div>
        <div className="order-3 w-12 h-12 bg-violet-400 rounded flex items-center justify-center text-white font-bold">2</div>
        <div className="order-1 w-12 h-12 bg-emerald-400 rounded flex items-center justify-center text-white font-bold">3</div>
      </div>
    </Section>
  </>
)

const GridCols = ({ cc }) => (
  <>
    <PageHeader title="Grid Template Columns" desc="Defines the column tracks of a grid." />
    <QR cc={cc} classes={['grid-cols-1','grid-cols-2','grid-cols-3','grid-cols-4','grid-cols-6','grid-cols-12','grid-cols-none']} />
    <Section title="grid-cols-3"><div className="grid grid-cols-3 gap-2">{boxes(9)}</div></Section>
    <Section title="grid-cols-4"><div className="grid grid-cols-4 gap-2">{boxes(8)}</div></Section>
  </>
)

const GridRows = ({ cc }) => (
  <>
    <PageHeader title="Grid Template Rows" desc="Defines the row tracks of a grid." />
    <QR cc={cc} classes={['grid-rows-1','grid-rows-2','grid-rows-3','grid-rows-4','grid-rows-none']} />
    <Section title="grid-rows-3 grid-flow-col"><div className="grid grid-rows-3 grid-flow-col gap-2">{boxes(9)}</div></Section>
  </>
)

const GridColumn = ({ cc }) => (
  <>
    <PageHeader title="Grid Column Span" desc="Controls how many columns a grid item spans." />
    <QR cc={cc} classes={['col-span-1','col-span-2','col-span-3','col-span-4','col-span-6','col-span-full','col-auto','col-start-1','col-start-2','col-end-3']} />
    <Section title="Column spanning in a 6-col grid">
      <div className="grid grid-cols-6 gap-2">
        <div className="col-span-6 h-8 bg-sky-400 rounded flex items-center justify-center text-white text-xs">col-span-6</div>
        <div className="col-span-4 h-8 bg-violet-400 rounded flex items-center justify-center text-white text-xs">col-span-4</div>
        <div className="col-span-2 h-8 bg-emerald-400 rounded flex items-center justify-center text-white text-xs">col-span-2</div>
        <div className="col-span-3 h-8 bg-amber-400 rounded flex items-center justify-center text-white text-xs">col-span-3</div>
        <div className="col-span-3 h-8 bg-rose-400 rounded flex items-center justify-center text-white text-xs">col-span-3</div>
      </div>
    </Section>
  </>
)

const GridRow = ({ cc }) => (
  <>
    <PageHeader title="Grid Row Span" desc="Controls how many rows a grid item spans." />
    <QR cc={cc} classes={['row-span-1','row-span-2','row-span-3','row-span-full','row-auto','row-start-1','row-start-2','row-end-3']} />
    <Section title="Row spanning">
      <div className="grid grid-cols-3 grid-rows-3 gap-2" style={{ height: 160 }}>
        <div className="row-span-3 bg-sky-400 rounded flex items-center justify-center text-white text-xs">row-span-3</div>
        <div className="col-span-2 bg-violet-400 rounded flex items-center justify-center text-white text-xs">1</div>
        <div className="col-span-2 bg-emerald-400 rounded flex items-center justify-center text-white text-xs">2</div>
        <div className="col-span-2 bg-amber-400 rounded flex items-center justify-center text-white text-xs">3</div>
      </div>
    </Section>
  </>
)

const GridFlow = ({ cc }) => (
  <>
    <PageHeader title="Grid Auto Flow" desc="Controls how auto-placed items are inserted into the grid." />
    <QR cc={cc} classes={['grid-flow-row','grid-flow-col','grid-flow-dense','grid-flow-row-dense','grid-flow-col-dense']} />
    <Section title="grid-flow-row"><div className="grid grid-cols-4 grid-flow-row gap-2">{boxes(8)}</div></Section>
    <Section title="grid-flow-col"><div className="grid grid-rows-3 grid-flow-col gap-2">{boxes(9)}</div></Section>
  </>
)

const Gap = ({ cc }) => (
  <>
    <PageHeader title="Gap" desc="Controls the gap between grid and flex items." />
    <QR cc={cc} classes={['gap-0','gap-px','gap-1','gap-2','gap-4','gap-6','gap-8','gap-x-4','gap-y-4']} />
    <Section title="gap-2 vs gap-8">
      <div className="flex gap-6 flex-wrap">
        {[['gap-2','2'],['gap-8','8']].map(([cls,l]) => (
          <div key={cls} className="demo-col">
            <div className={`grid grid-cols-3 ${cls}`}>{boxes(9)}</div>
            <div className="label">{cls}</div>
          </div>
        ))}
      </div>
    </Section>
  </>
)

const JustifyContent = ({ cc }) => {
  const opts = ['justify-start','justify-end','justify-center','justify-between','justify-around','justify-evenly']
  const b = <>{[1,2,3].map(i => <div key={i} className="w-10 h-8 bg-sky-400 rounded"></div>)}</>
  return (
    <>
      <PageHeader title="Justify Content" desc="Controls how flex/grid items are positioned along the main axis." />
      <QR cc={cc} classes={[...opts,'justify-stretch','justify-normal']} />
      <Section title="justify-content options">
        {opts.map(cls => (
          <div key={cls} style={{ marginBottom: 8 }}>
            <div className={`flex ${cls} gap-2 bg-slate-700 rounded p-2`}>{b}</div>
            <div className="label" style={{ textAlign: 'left' }}>{cls}</div>
          </div>
        ))}
      </Section>
    </>
  )
}

const JustifyItems = ({ cc }) => (
  <>
    <PageHeader title="Justify Items" desc="Controls how grid items are aligned along the inline axis within their area." />
    <QR cc={cc} classes={['justify-items-start','justify-items-end','justify-items-center','justify-items-stretch','justify-items-normal']} />
    <Section title="justify-items options">
      {['justify-items-start','justify-items-end','justify-items-center','justify-items-stretch'].map(cls => (
        <div key={cls} style={{ marginBottom: 8 }}>
          <div className={`grid grid-cols-3 ${cls} gap-2 bg-slate-700 rounded p-2`}>
            {[1,2,3].map(i => <div key={i} className="h-8 w-16 bg-sky-400 rounded"></div>)}
          </div>
          <div className="label" style={{ textAlign: 'left' }}>{cls}</div>
        </div>
      ))}
    </Section>
  </>
)

const AlignContent = ({ cc }) => {
  const opts = ['content-start','content-end','content-center','content-between','content-around','content-evenly']
  return (
    <>
      <PageHeader title="Align Content" desc="Controls how rows are positioned in a multi-row flex or grid container." />
      <QR cc={cc} classes={[...opts,'content-normal','content-stretch','content-baseline']} />
      <Section title="Align content options" note="Fixed-height wrapping flex container.">
        <div className="flex gap-3 flex-wrap">
          {opts.map(cls => (
            <div key={cls} className="demo-col">
              <div className={`flex flex-wrap ${cls} gap-1 bg-slate-700 rounded p-1`} style={{ height: 80, width: 120 }}>
                {[...Array(4)].map((_,i) => <div key={i} className="w-10 h-7 bg-sky-400 rounded"></div>)}
              </div>
              <div className="label">{cls.replace('content-','')}</div>
            </div>
          ))}
        </div>
      </Section>
    </>
  )
}

const AlignItems = ({ cc }) => {
  const opts = ['items-start','items-end','items-center','items-baseline','items-stretch']
  return (
    <>
      <PageHeader title="Align Items" desc="Controls how flex/grid items are positioned along the cross axis." />
      <QR cc={cc} classes={opts} />
      <Section title="Align items options" note="Three boxes of different heights.">
        <div className="flex gap-4 flex-wrap">
          {opts.map(cls => (
            <div key={cls} className="demo-col">
              <div className={`flex ${cls} gap-2 bg-slate-700 rounded p-2`} style={{ height: 72 }}>
                <div className="w-8 h-8 bg-sky-400 rounded"></div>
                <div className="w-8 h-14 bg-violet-400 rounded"></div>
                <div className="w-8 h-10 bg-emerald-400 rounded"></div>
              </div>
              <div className="label">{cls}</div>
            </div>
          ))}
        </div>
      </Section>
    </>
  )
}

const AlignSelf = ({ cc }) => {
  const opts = ['self-auto','self-start','self-end','self-center','self-stretch','self-baseline']
  return (
    <>
      <PageHeader title="Align Self" desc="Controls how an individual flex/grid item is aligned along the cross axis." />
      <QR cc={cc} classes={opts} />
      <Section title="Align self" note="Middle box (sky) uses different self-* value; outer boxes use items-stretch.">
        <div className="flex gap-4 flex-wrap">
          {opts.map(cls => (
            <div key={cls} className="demo-col">
              <div className="flex items-stretch gap-1 bg-slate-700 rounded p-2" style={{ height: 72 }}>
                <div className="w-8 bg-slate-500 rounded"></div>
                <div className={`w-8 ${cls} bg-sky-400 rounded`}></div>
                <div className="w-8 bg-slate-500 rounded"></div>
              </div>
              <div className="label">{cls}</div>
            </div>
          ))}
        </div>
      </Section>
    </>
  )
}

const PlaceContent = ({ cc }) => {
  const opts = ['place-content-center','place-content-start','place-content-end','place-content-between','place-content-around','place-content-evenly','place-content-stretch']
  return (
    <>
      <PageHeader title="Place Content" desc="Shorthand for align-content and justify-content." />
      <QR cc={cc} classes={opts} />
      <Section title="Place content options">
        <div className="flex gap-3 flex-wrap">
          {opts.map(cls => (
            <div key={cls} className="demo-col">
              <div className={`grid grid-cols-2 ${cls} gap-1 bg-slate-700 rounded p-1`} style={{ height: 80, width: 120 }}>
                {[1,2,3,4].map(i => <div key={i} className="w-8 h-7 bg-sky-400 rounded"></div>)}
              </div>
              <div className="label">{cls.replace('place-content-','')}</div>
            </div>
          ))}
        </div>
      </Section>
    </>
  )
}

// ── Borders ───────────────────────────────────────────────────────────────────
const BorderRadius = ({ cc }) => (
  <>
    <PageHeader title="Border Radius" desc="Controls the border radius of an element." />
    <QR cc={cc} classes={['rounded-none','rounded-sm','rounded','rounded-md','rounded-lg','rounded-xl','rounded-2xl','rounded-3xl','rounded-full','rounded-t','rounded-r','rounded-b','rounded-l','rounded-tl','rounded-tr','rounded-br','rounded-bl']} />
    <Section title="Border radius scale">
      <div className="flex gap-3 flex-wrap">
        {['rounded-none','rounded-sm','rounded','rounded-md','rounded-lg','rounded-xl','rounded-2xl','rounded-full'].map(cls => (
          <div key={cls} className="demo-col">
            <div className={`w-12 h-12 bg-sky-400 ${cls}`}></div>
            <div className="label">{cls.replace('rounded-','') || 'DEFAULT'}</div>
          </div>
        ))}
      </div>
    </Section>
  </>
)

const BorderWidth = ({ cc }) => (
  <>
    <PageHeader title="Border Width" desc="Controls the border width of an element." />
    <QR cc={cc} classes={['border','border-0','border-2','border-4','border-8','border-t','border-r','border-b','border-l','border-t-2','border-b-2','border-x','border-y','border-x-2','border-y-2']} />
    <Section title="Border width scale">
      <div className="flex gap-3 flex-wrap">
        {['border','border-2','border-4','border-8'].map(cls => (
          <div key={cls} className="demo-col">
            <div className={`w-12 h-12 ${cls} border-sky-400 rounded bg-transparent`}></div>
            <div className="label">{cls}</div>
          </div>
        ))}
      </div>
    </Section>
    <Section title="Individual sides">
      <div className="flex gap-3 flex-wrap">
        {['border-t-4','border-r-4','border-b-4','border-l-4','border-x-4','border-y-4'].map(cls => (
          <div key={cls} className="demo-col">
            <div className={`w-12 h-12 ${cls} border-sky-400 bg-slate-700 rounded`}></div>
            <div className="label">{cls}</div>
          </div>
        ))}
      </div>
    </Section>
  </>
)

const BorderColor = ({ cc }) => {
  const colors = ['border-slate-400','border-red-400','border-orange-400','border-green-400','border-sky-400','border-blue-400','border-violet-400','border-pink-400','border-sky-400/50']
  return (
    <>
      <PageHeader title="Border Color" desc="Controls the color of an element's borders." />
      <QR cc={cc} classes={colors} />
      <Section title="Border colors">
        <div className="flex gap-3 flex-wrap">
          {colors.map(cls => (
            <div key={cls} className="demo-col">
              <div className={`w-10 h-10 border-2 ${cls} rounded bg-transparent`}></div>
              <div className="label">{cls.replace('border-','')}</div>
            </div>
          ))}
        </div>
      </Section>
    </>
  )
}

const BorderStyle = ({ cc }) => (
  <>
    <PageHeader title="Border Style" desc="Controls the style of an element's borders." />
    <QR cc={cc} classes={['border-solid','border-dashed','border-dotted','border-double','border-none']} />
    <Section title="Border styles">
      <div className="flex gap-3 flex-wrap">
        {['border-solid','border-dashed','border-dotted','border-double','border-none'].map(cls => (
          <div key={cls} className="demo-col">
            <div className={`w-16 h-16 border-4 border-sky-400 ${cls} rounded bg-transparent`}></div>
            <div className="label">{cls.replace('border-','')}</div>
          </div>
        ))}
      </div>
    </Section>
  </>
)

const DivideWidth = ({ cc }) => (
  <>
    <PageHeader title="Divide Width" desc="Controls the border width between child elements." />
    <QR cc={cc} classes={['divide-x','divide-x-2','divide-x-4','divide-y','divide-y-2','divide-y-4','divide-x-reverse','divide-y-reverse']} />
    <Section title="divide-y-2 (horizontal dividers)">
      <div className="divide-y-2 divide-sky-400 border border-sky-400 rounded" style={{ maxWidth: 300 }}>
        {['First item','Second item','Third item'].map(t => <div key={t} className="p-3 text-sm text-slate-300">{t}</div>)}
      </div>
    </Section>
    <Section title="divide-x-2 (vertical dividers)">
      <div className="flex divide-x-2 divide-sky-400 border border-sky-400 rounded" style={{ maxWidth: 300 }}>
        {['One','Two','Three'].map(t => <div key={t} className="p-3 text-sm text-slate-300">{t}</div>)}
      </div>
    </Section>
  </>
)

const DivideColor = ({ cc }) => {
  const colors = ['divide-sky-400','divide-red-400','divide-green-400','divide-violet-400','divide-amber-400','divide-sky-400/50']
  return (
    <>
      <PageHeader title="Divide Color" desc="Controls the color of dividers between child elements." />
      <QR cc={cc} classes={colors} />
      <Section title="Divide colors">
        <div className="flex gap-4 flex-wrap">
          {colors.slice(0,4).map(cls => (
            <div key={cls} className="demo-col">
              <div className={`divide-y-2 ${cls} border border-slate-600 rounded`} style={{ width: 120 }}>
                {['A','B','C'].map(t => <div key={t} className="p-2 text-xs text-slate-300">{t}</div>)}
              </div>
              <div className="label">{cls.replace('divide-','')}</div>
            </div>
          ))}
        </div>
      </Section>
    </>
  )
}

const DivideStyle = ({ cc }) => (
  <>
    <PageHeader title="Divide Style" desc="Controls the style of dividers between child elements." />
    <QR cc={cc} classes={['divide-solid','divide-dashed','divide-dotted','divide-double','divide-none']} />
    <Section title="Divide styles">
      <div className="flex gap-4 flex-wrap">
        {['divide-solid','divide-dashed','divide-dotted','divide-double','divide-none'].map(cls => (
          <div key={cls} className="demo-col">
            <div className={`divide-y-2 divide-sky-400 ${cls} border border-slate-600 rounded`} style={{ width: 100 }}>
              {['A','B','C'].map(t => <div key={t} className="p-2 text-xs text-slate-300">{t}</div>)}
            </div>
            <div className="label">{cls.replace('divide-','')}</div>
          </div>
        ))}
      </div>
    </Section>
  </>
)

const Outline = ({ cc }) => (
  <>
    <PageHeader title="Outline" desc="Controls the outline of an element." />
    <QR cc={cc} classes={['outline','outline-none','outline-solid','outline-dashed','outline-dotted','outline-double','outline-0','outline-1','outline-2','outline-4','outline-8','outline-sky-400','outline-red-400','outline-offset-0','outline-offset-2','outline-offset-4','outline-offset-8']} />
    <Section title="Outline styles">
      <div className="flex gap-3 flex-wrap">
        {['outline','outline-dashed','outline-dotted','outline-double'].map(cls => (
          <div key={cls} className="demo-col">
            <div className={`w-12 h-12 outline-2 outline-sky-400 ${cls} rounded bg-slate-700`}></div>
            <div className="label">{cls}</div>
          </div>
        ))}
      </div>
    </Section>
    <Section title="Outline offset">
      <div className="flex gap-3">
        {['outline-offset-0','outline-offset-2','outline-offset-4','outline-offset-8'].map(cls => (
          <div key={cls} className="demo-col">
            <div className={`w-12 h-12 outline outline-2 outline-sky-400 ${cls} rounded bg-slate-700`}></div>
            <div className="label">{cls}</div>
          </div>
        ))}
      </div>
    </Section>
  </>
)

// ── Effects ───────────────────────────────────────────────────────────────────
const BoxShadow = ({ cc }) => (
  <>
    <PageHeader title="Box Shadow" desc="Controls the box shadow of an element." />
    <QR cc={cc} classes={['shadow-sm','shadow','shadow-md','shadow-lg','shadow-xl','shadow-2xl','shadow-inner','shadow-none','shadow-[4px_4px_0_0]','shadow-black','shadow-sky-400']} />
    <Section title="Shadow scale">
      <div className="flex gap-4 flex-wrap p-4" style={{ background: '#e2e8f0', borderRadius: 8 }}>
        {['shadow-sm','shadow','shadow-md','shadow-lg','shadow-xl','shadow-2xl'].map(cls => (
          <div key={cls} className="demo-col">
            <div className={`w-14 h-14 bg-white ${cls} rounded-lg`}></div>
            <div className="label" style={{ color: '#475569' }}>{cls}</div>
          </div>
        ))}
      </div>
    </Section>
    <Section title="Arbitrary shadow + color">
      <div className="p-4" style={{ background: '#e2e8f0', borderRadius: 8 }}>
        <div className="w-16 h-16 bg-white shadow-[4px_4px_0_0] shadow-black rounded"></div>
      </div>
    </Section>
  </>
)

const Opacity = ({ cc }) => (
  <>
    <PageHeader title="Opacity" desc="Controls the opacity of an element." />
    <QR cc={cc} classes={['opacity-0','opacity-5','opacity-10','opacity-25','opacity-50','opacity-75','opacity-90','opacity-100']} />
    <Section title="Opacity scale">
      <div className="flex gap-3">
        {['opacity-0','opacity-25','opacity-50','opacity-75','opacity-100'].map(cls => (
          <div key={cls} className="demo-col">
            <div className={`w-12 h-12 bg-sky-400 rounded ${cls}`}></div>
            <div className="label">{cls.replace('opacity-','')}</div>
          </div>
        ))}
      </div>
    </Section>
  </>
)

const Ring = ({ cc }) => (
  <>
    <PageHeader title="Ring" desc="Creates an outline ring using box-shadow, commonly used for focus states." />
    <QR cc={cc} classes={['ring','ring-0','ring-1','ring-2','ring-4','ring-8','ring-inset','ring-sky-400','ring-red-400','ring-offset-0','ring-offset-2','ring-offset-4','ring-offset-sky-400']} />
    <Section title="Ring width">
      <div className="flex gap-4">
        {['ring','ring-2','ring-4','ring-8'].map(cls => (
          <div key={cls} className="demo-col">
            <div className={`w-12 h-12 ${cls} rounded bg-slate-700`}></div>
            <div className="label">{cls}</div>
          </div>
        ))}
      </div>
    </Section>
    <Section title="Ring color">
      <div className="flex gap-4">
        {['ring-sky-400','ring-red-400','ring-emerald-400'].map(cls => (
          <div key={cls} className="demo-col">
            <div className={`w-12 h-12 ring-2 ${cls} rounded bg-slate-700`}></div>
            <div className="label">{cls.replace('ring-','')}</div>
          </div>
        ))}
      </div>
    </Section>
    <Section title="Ring offset">
      <div className="flex gap-4 p-4" style={{ background: 'var(--bg2)', borderRadius: 8 }}>
        {['ring-offset-0','ring-offset-2','ring-offset-4'].map(cls => (
          <div key={cls} className="demo-col">
            <div className={`w-12 h-12 ring-2 ring-sky-400 ${cls} rounded bg-slate-500`}></div>
            <div className="label">{cls}</div>
          </div>
        ))}
      </div>
    </Section>
  </>
)

const TextShadow = ({ cc }) => (
  <>
    <PageHeader title="Text Shadow" desc="Controls the shadow applied to text." />
    <QR cc={cc} classes={['text-shadow-sm','text-shadow','text-shadow-md','text-shadow-lg','text-shadow-none','text-shadow-sky-400','text-shadow-red-400']} />
    <Section title="Text shadow scale">
      {['text-shadow-sm','text-shadow','text-shadow-lg'].map(cls => (
        <p key={cls} className={`${cls} text-2xl font-bold text-white mb-2`}>{cls}</p>
      ))}
    </Section>
  </>
)

// ── Backgrounds ───────────────────────────────────────────────────────────────
const BgColor = ({ cc }) => {
  const colors = ['bg-slate-500','bg-red-500','bg-orange-500','bg-yellow-500','bg-lime-500','bg-green-500','bg-teal-500','bg-sky-500','bg-blue-500','bg-violet-500','bg-pink-500','bg-rose-500','bg-white','bg-black','bg-sky-400/75','bg-sky-400/50','bg-sky-400/25']
  return (
    <>
      <PageHeader title="Background Color" desc="Controls the background color of an element." />
      <QR cc={cc} classes={colors} />
      <Section title="Color palette">
        <div className="flex flex-wrap gap-2">
          {colors.map(cls => (
            <div key={cls} className="demo-col">
              <div className={`w-10 h-10 rounded ${cls}`}></div>
              <div className="label">{cls.replace('bg-','')}</div>
            </div>
          ))}
        </div>
      </Section>
    </>
  )
}

const BgImage = ({ cc }) => (
  <>
    <PageHeader title="Background Image" desc="Controls the background image, including gradient shorthands." />
    <QR cc={cc} classes={['bg-none','bg-linear-to-t','bg-linear-to-tr','bg-linear-to-r','bg-linear-to-br','bg-linear-to-b','bg-linear-to-bl','bg-linear-to-l','bg-linear-to-tl']} />
    <Section title="Gradient directions">
      <div className="flex flex-wrap gap-2">
        {['bg-linear-to-r','bg-linear-to-br','bg-linear-to-b','bg-linear-to-t','bg-linear-to-tl','bg-linear-to-l'].map(cls => (
          <div key={cls} className="demo-col">
            <div className={`w-14 h-14 rounded ${cls} from-sky-400 to-violet-500`}></div>
            <div className="label">{cls.replace('bg-linear-','')}</div>
          </div>
        ))}
      </div>
    </Section>
  </>
)

const BgSize = ({ cc }) => (
  <>
    <PageHeader title="Background Size" desc="Controls the size of a background image." />
    <QR cc={cc} classes={['bg-auto','bg-cover','bg-contain']} />
    <Section title="Background size">
      <div className="flex gap-4 flex-wrap">
        {['bg-auto','bg-cover','bg-contain'].map(cls => (
          <div key={cls} className="demo-col">
            <div className={`w-32 h-24 rounded border border-slate-600 ${cls}`} style={{ backgroundImage: 'url(https://picsum.photos/seed/wrbg/400/300)', backgroundColor: '#334155' }}></div>
            <div className="label">{cls}</div>
          </div>
        ))}
      </div>
    </Section>
  </>
)

const BgPosition = ({ cc }) => (
  <>
    <PageHeader title="Background Position" desc="Controls the starting position of a background image." />
    <QR cc={cc} classes={['bg-bottom','bg-center','bg-left','bg-left-bottom','bg-left-top','bg-right','bg-right-bottom','bg-right-top','bg-top']} />
    <Section title="Background positions">
      <div className="flex flex-wrap gap-3">
        {['bg-center','bg-top','bg-bottom','bg-left','bg-right'].map(cls => (
          <div key={cls} className="demo-col">
            <div className={`w-20 h-16 rounded border border-slate-600 bg-cover ${cls}`} style={{ backgroundImage: 'url(https://picsum.photos/seed/wrpos/300/200)' }}></div>
            <div className="label">{cls.replace('bg-','')}</div>
          </div>
        ))}
      </div>
    </Section>
  </>
)

const BgRepeat = ({ cc }) => (
  <>
    <PageHeader title="Background Repeat" desc="Controls the repetition of background images." />
    <QR cc={cc} classes={['bg-repeat','bg-no-repeat','bg-repeat-x','bg-repeat-y','bg-repeat-round','bg-repeat-space']} />
    <Section title="Background repeat">
      <div className="flex flex-wrap gap-3">
        {['bg-repeat','bg-no-repeat','bg-repeat-x','bg-repeat-y'].map(cls => (
          <div key={cls} className="demo-col">
            <div className={`w-32 h-24 rounded border border-slate-600 ${cls}`} style={{ backgroundImage: 'url(https://picsum.photos/seed/wrrp/60/60)', backgroundColor: '#1e293b' }}></div>
            <div className="label">{cls.replace('bg-','')}</div>
          </div>
        ))}
      </div>
    </Section>
  </>
)

const BgClip = ({ cc }) => (
  <>
    <PageHeader title="Background Clip" desc="Controls the bounding box of a background." />
    <QR cc={cc} classes={['bg-clip-border','bg-clip-padding','bg-clip-content','bg-clip-text']} />
    <Section title="bg-clip-text" note="Background clipped to text shape — requires transparent text color.">
      <p className="bg-clip-text bg-linear-to-r from-sky-400 to-violet-500 text-transparent text-4xl font-black">Windrunner</p>
    </Section>
    <Section title="bg-clip variants">
      <div className="flex gap-3">
        {['bg-clip-border','bg-clip-padding','bg-clip-content'].map(cls => (
          <div key={cls} className="demo-col">
            <div className={`w-16 h-16 ${cls} p-3 border-4 border-dashed border-sky-400 bg-sky-400/30 rounded`}></div>
            <div className="label">{cls.replace('bg-clip-','')}</div>
          </div>
        ))}
      </div>
    </Section>
  </>
)

const Gradient = ({ cc }) => (
  <>
    <PageHeader title="Gradient" desc="Controls background gradients using from, via, and to color stops." />
    <QR cc={cc} classes={['from-sky-400','from-violet-500','via-purple-500','via-emerald-400','to-blue-500','to-pink-500','from-sky-400/50','to-blue-500/75']} />
    <Section title="Multi-stop gradients">
      <div>
        <div className="h-12 rounded mb-2 bg-linear-to-r from-sky-400 to-blue-600"></div>
        <div className="h-12 rounded mb-2 bg-linear-to-r from-violet-500 via-purple-500 to-pink-500"></div>
        <div className="h-12 rounded bg-linear-to-r from-emerald-400 via-sky-400 to-violet-500"></div>
      </div>
    </Section>
  </>
)

// ── Transforms ────────────────────────────────────────────────────────────────
const Scale = ({ cc }) => (
  <>
    <PageHeader title="Scale" desc="Scales an element with a CSS transform." />
    <QR cc={cc} classes={['scale-50','scale-75','scale-90','scale-100','scale-105','scale-110','scale-125','scale-150','scale-x-75','scale-y-75','-scale-x-100']} />
    <Section title="Scale examples">
      <div className="flex gap-4 items-center" style={{ height: 100 }}>
        {['scale-75','scale-100','scale-110','scale-125','scale-150'].map(cls => (
          <div key={cls} className="demo-col">
            <div className={`w-10 h-10 bg-sky-400 rounded ${cls}`}></div>
            <div className="label">{cls}</div>
          </div>
        ))}
      </div>
    </Section>
  </>
)

const Rotate = ({ cc }) => (
  <>
    <PageHeader title="Rotate" desc="Rotates an element with a CSS transform." />
    <QR cc={cc} classes={['rotate-0','rotate-1','rotate-2','rotate-3','rotate-6','rotate-12','rotate-45','rotate-90','rotate-180','-rotate-45','-rotate-90','-rotate-180']} />
    <Section title="Rotate examples">
      <div className="flex gap-4 items-center flex-wrap">
        {['rotate-0','rotate-12','rotate-45','rotate-90','rotate-180','-rotate-45'].map(cls => (
          <div key={cls} className="demo-col">
            <div className={`w-10 h-10 bg-sky-400 rounded ${cls}`}></div>
            <div className="label">{cls}</div>
          </div>
        ))}
      </div>
    </Section>
  </>
)

const Translate = ({ cc }) => (
  <>
    <PageHeader title="Translate" desc="Translates an element along X or Y axis." />
    <QR cc={cc} classes={['translate-x-0','translate-x-2','translate-x-4','translate-x-8','translate-y-0','translate-y-2','translate-y-4','translate-y-8','-translate-x-4','-translate-y-4','translate-x-1/2','translate-y-full','translate-x-[20px]']} />
    <Section title="Translate examples" note="Blue box is offset from original gray ghost position.">
      <div className="flex gap-6 flex-wrap" style={{ height: 100 }}>
        {[['translate-x-4','x+4'],['translate-y-4','y+4'],['-translate-x-4','x-4'],['-translate-y-4','y-4']].map(([cls,l]) => (
          <div key={cls} className="demo-col" style={{ position: 'relative', width: 72, height: 72, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 40, height: 40, background: 'var(--bg3)', borderRadius: 4, position: 'absolute' }}></div>
            <div className={`w-10 h-10 bg-sky-400 rounded ${cls}`} style={{ position: 'absolute' }}></div>
            <div className="label" style={{ position: 'absolute', bottom: -16 }}>{l}</div>
          </div>
        ))}
      </div>
    </Section>
  </>
)

const Skew = ({ cc }) => (
  <>
    <PageHeader title="Skew" desc="Skews an element along the X or Y axis." />
    <QR cc={cc} classes={['skew-x-0','skew-x-3','skew-x-6','skew-x-12','skew-y-0','skew-y-3','skew-y-6','skew-y-12','-skew-x-6','-skew-y-6']} />
    <Section title="Skew examples">
      <div className="flex gap-4">
        {['skew-x-0','skew-x-3','skew-x-6','skew-x-12','skew-y-6'].map(cls => (
          <div key={cls} className="demo-col">
            <div className={`w-12 h-12 bg-sky-400 rounded ${cls}`}></div>
            <div className="label">{cls}</div>
          </div>
        ))}
      </div>
    </Section>
  </>
)

const TransformOrigin = ({ cc }) => (
  <>
    <PageHeader title="Transform Origin" desc="Controls the origin point for element transforms." />
    <QR cc={cc} classes={['origin-center','origin-top','origin-top-right','origin-right','origin-bottom-right','origin-bottom','origin-bottom-left','origin-left','origin-top-left']} />
    <Section title="Origin with rotate-45" note="All boxes rotate 45deg — origin point changes where rotation pivots.">
      <div className="flex flex-wrap gap-3">
        {['origin-center','origin-top','origin-top-right','origin-right','origin-bottom-right','origin-bottom','origin-bottom-left','origin-left','origin-top-left'].map(cls => (
          <div key={cls} className="demo-col">
            <div className={`w-10 h-10 bg-sky-400 rounded rotate-45 ${cls}`}></div>
            <div className="label">{cls.replace('origin-','')}</div>
          </div>
        ))}
      </div>
    </Section>
  </>
)

// ── Transitions ───────────────────────────────────────────────────────────────
const Transition = ({ cc }) => (
  <>
    <PageHeader title="Transition Property" desc="Controls which properties transition when they change." />
    <QR cc={cc} classes={['transition','transition-all','transition-colors','transition-opacity','transition-shadow','transition-transform','transition-none']} />
    <Section title="Hover to see transitions" note="Each button animates a different property on hover.">
      <div className="flex gap-3 flex-wrap">
        {[['transition-colors','bg-sky-500 hover:bg-violet-500','colors'],['transition-opacity','opacity-100 hover:opacity-30 bg-sky-500','opacity'],['transition-transform','hover:scale-110 bg-sky-500','transform']].map(([t,extra,l]) => (
          <div key={t} className="demo-col">
            <button className={`${t} duration-300 ${extra} text-white text-xs px-4 py-2 rounded cursor-pointer`}>{l}</button>
          </div>
        ))}
      </div>
    </Section>
  </>
)

const Duration = ({ cc }) => (
  <>
    <PageHeader title="Duration" desc="Controls how long transitions take to complete." />
    <QR cc={cc} classes={['duration-75','duration-100','duration-150','duration-200','duration-300','duration-500','duration-700','duration-1000']} />
    <Section title="Hover to compare speeds">
      <div className="flex gap-3 flex-wrap">
        {['duration-150','duration-300','duration-700','duration-1000'].map(cls => (
          <button key={cls} className={`transition-all ${cls} bg-sky-500 hover:bg-violet-500 hover:scale-110 text-white text-xs px-4 py-2 rounded cursor-pointer`}>{cls}</button>
        ))}
      </div>
    </Section>
  </>
)

const TimingFunction = ({ cc }) => (
  <>
    <PageHeader title="Timing Function" desc="Controls the easing curve of transitions." />
    <QR cc={cc} classes={['ease-linear','ease-in','ease-out','ease-in-out']} />
    <Section title="Hover to compare easing (700ms)">
      <div className="flex gap-3 flex-wrap">
        {['ease-linear','ease-in','ease-out','ease-in-out'].map(cls => (
          <button key={cls} className={`transition-all duration-700 ${cls} bg-sky-500 hover:scale-125 text-white text-xs px-4 py-2 rounded cursor-pointer`}>{cls.replace('ease-','')}</button>
        ))}
      </div>
    </Section>
  </>
)

const Delay = ({ cc }) => (
  <>
    <PageHeader title="Transition Delay" desc="Controls how long to wait before a transition starts." />
    <QR cc={cc} classes={['delay-0','delay-75','delay-100','delay-150','delay-200','delay-300','delay-500','delay-700','delay-1000']} />
    <Section title="Hover — each button starts after a different delay">
      <div className="flex gap-3 flex-wrap">
        {['delay-0','delay-150','delay-300','delay-500'].map(cls => (
          <button key={cls} className={`transition-all duration-300 ${cls} bg-sky-500 hover:bg-violet-500 text-white text-xs px-3 py-2 rounded cursor-pointer`}>{cls}</button>
        ))}
      </div>
    </Section>
  </>
)

const Animation = ({ cc }) => (
  <>
    <PageHeader title="Animation" desc="Pre-built CSS animations for common UI patterns." />
    <QR cc={cc} classes={['animate-spin','animate-ping','animate-pulse','animate-bounce','animate-none']} />
    <Section title="Built-in animations">
      <div className="flex gap-6 items-end" style={{ height: 80 }}>
        {[['animate-spin','spin','sky'],['animate-pulse','pulse','violet'],['animate-bounce','bounce','emerald']].map(([cls,l,c]) => (
          <div key={cls} className="demo-col">
            <div className={`w-10 h-10 bg-${c}-400 rounded ${cls === 'animate-spin' ? 'rounded-full' : 'rounded'} ${cls}`}></div>
            <div className="label">{l}</div>
          </div>
        ))}
        <div className="demo-col" style={{ position: 'relative' }}>
          <div className="w-10 h-10 bg-amber-400 rounded-full animate-ping"></div>
          <div className="label">ping</div>
        </div>
      </div>
    </Section>
  </>
)

// ── Filters ───────────────────────────────────────────────────────────────────
const Blur = ({ cc }) => (
  <>
    <PageHeader title="Blur" desc="Applies a Gaussian blur filter." />
    <QR cc={cc} classes={['blur-none','blur-sm','blur','blur-md','blur-lg','blur-xl','blur-2xl','blur-3xl','blur-[2px]','backdrop-blur-none','backdrop-blur-sm','backdrop-blur','backdrop-blur-md','backdrop-blur-lg','backdrop-blur-xl']} />
    <Section title="Blur scale">
      <div className="flex gap-3 flex-wrap">
        {['blur-none','blur-sm','blur','blur-md','blur-lg','blur-xl'].map(cls => (
          <div key={cls} className="demo-col">
            <div className={`w-12 h-12 rounded ${cls}`} style={{ background: 'linear-gradient(135deg,#38bdf8,#818cf8)' }}></div>
            <div className="label">{cls.replace('blur-','') || 'DEFAULT'}</div>
          </div>
        ))}
      </div>
    </Section>
    <Section title="Backdrop blur (frosted glass)">
      <div className="relative w-48 h-28 rounded overflow-hidden" style={{ background: 'linear-gradient(135deg,#38bdf8 0%,#818cf8 50%,#f472b6 100%)' }}>
        <div className="backdrop-blur-md bg-white/20 absolute inset-2 rounded flex items-center justify-center text-white text-xs font-bold">backdrop-blur-md</div>
      </div>
    </Section>
  </>
)

const Brightness = ({ cc }) => (
  <>
    <PageHeader title="Brightness" desc="Applies a brightness filter." />
    <QR cc={cc} classes={['brightness-0','brightness-50','brightness-75','brightness-90','brightness-100','brightness-110','brightness-125','brightness-150','brightness-200','backdrop-brightness-50','backdrop-brightness-100','backdrop-brightness-150']} />
    <Section title="Brightness scale">
      <div className="flex gap-3 flex-wrap">
        {['brightness-50','brightness-75','brightness-100','brightness-125','brightness-150','brightness-200'].map(cls => (
          <div key={cls} className="demo-col">
            <img src="https://picsum.photos/seed/wrbri/80/80" className={`w-12 h-12 rounded object-cover ${cls}`} />
            <div className="label">{cls.replace('brightness-','')}</div>
          </div>
        ))}
      </div>
    </Section>
  </>
)

const Contrast = ({ cc }) => (
  <>
    <PageHeader title="Contrast" desc="Applies a contrast filter." />
    <QR cc={cc} classes={['contrast-0','contrast-50','contrast-75','contrast-100','contrast-125','contrast-150','contrast-200','backdrop-contrast-50','backdrop-contrast-75','backdrop-contrast-100','backdrop-contrast-125','backdrop-contrast-150']} />
    <Section title="Contrast scale">
      <div className="flex gap-3 flex-wrap">
        {['contrast-50','contrast-75','contrast-100','contrast-125','contrast-150','contrast-200'].map(cls => (
          <div key={cls} className="demo-col">
            <img src="https://picsum.photos/seed/wrcon/80/80" className={`w-12 h-12 rounded object-cover ${cls}`} />
            <div className="label">{cls.replace('contrast-','')}</div>
          </div>
        ))}
      </div>
    </Section>
  </>
)

const Grayscale = ({ cc }) => (
  <>
    <PageHeader title="Grayscale" desc="Applies a grayscale filter." />
    <QR cc={cc} classes={['grayscale-0','grayscale','grayscale-50','backdrop-grayscale-0','backdrop-grayscale']} />
    <Section title="Grayscale">
      <div className="flex gap-4">
        {['grayscale-0','grayscale'].map(cls => (
          <div key={cls} className="demo-col">
            <img src="https://picsum.photos/seed/wrgray/80/80" className={`w-16 h-16 rounded object-cover ${cls}`} />
            <div className="label">{cls}</div>
          </div>
        ))}
      </div>
    </Section>
  </>
)

const HueRotate = ({ cc }) => (
  <>
    <PageHeader title="Hue Rotate" desc="Applies a hue rotation filter." />
    <QR cc={cc} classes={['hue-rotate-0','hue-rotate-15','hue-rotate-30','hue-rotate-60','hue-rotate-90','hue-rotate-180','-hue-rotate-30','-hue-rotate-90','backdrop-hue-rotate-90']} />
    <Section title="Hue rotate scale">
      <div className="flex gap-3 flex-wrap">
        {['hue-rotate-0','hue-rotate-30','hue-rotate-90','hue-rotate-180','-hue-rotate-90'].map(cls => (
          <div key={cls} className="demo-col">
            <div className={`w-12 h-12 rounded ${cls}`} style={{ background: 'linear-gradient(135deg,#38bdf8,#f472b6,#4ade80)' }}></div>
            <div className="label">{cls.replace('hue-rotate-','')}</div>
          </div>
        ))}
      </div>
    </Section>
  </>
)

const Invert = ({ cc }) => (
  <>
    <PageHeader title="Invert" desc="Applies an invert filter." />
    <QR cc={cc} classes={['invert-0','invert','invert-50','backdrop-invert-0','backdrop-invert']} />
    <Section title="Invert">
      <div className="flex gap-4">
        {['invert-0','invert'].map(cls => (
          <div key={cls} className="demo-col">
            <img src="https://picsum.photos/seed/wrinv/80/80" className={`w-16 h-16 rounded object-cover ${cls}`} />
            <div className="label">{cls}</div>
          </div>
        ))}
      </div>
    </Section>
  </>
)

const Saturate = ({ cc }) => (
  <>
    <PageHeader title="Saturate" desc="Applies a saturation filter." />
    <QR cc={cc} classes={['saturate-0','saturate-50','saturate-100','saturate-150','saturate-200','backdrop-saturate-50','backdrop-saturate-100','backdrop-saturate-150','backdrop-saturate-200']} />
    <Section title="Saturate scale">
      <div className="flex gap-3 flex-wrap">
        {['saturate-0','saturate-50','saturate-100','saturate-150','saturate-200'].map(cls => (
          <div key={cls} className="demo-col">
            <img src="https://picsum.photos/seed/wrsat/80/80" className={`w-12 h-12 rounded object-cover ${cls}`} />
            <div className="label">{cls.replace('saturate-','')}</div>
          </div>
        ))}
      </div>
    </Section>
  </>
)

const Sepia = ({ cc }) => (
  <>
    <PageHeader title="Sepia" desc="Applies a sepia filter." />
    <QR cc={cc} classes={['sepia-0','sepia','sepia-50','backdrop-sepia-0','backdrop-sepia']} />
    <Section title="Sepia">
      <div className="flex gap-4">
        {['sepia-0','sepia'].map(cls => (
          <div key={cls} className="demo-col">
            <img src="https://picsum.photos/seed/wrsep/80/80" className={`w-16 h-16 rounded object-cover ${cls}`} />
            <div className="label">{cls}</div>
          </div>
        ))}
      </div>
    </Section>
  </>
)

const DropShadow = ({ cc }) => (
  <>
    <PageHeader title="Drop Shadow" desc="Applies a drop-shadow filter that follows element shape." />
    <QR cc={cc} classes={['drop-shadow-sm','drop-shadow','drop-shadow-md','drop-shadow-lg','drop-shadow-xl','drop-shadow-2xl','drop-shadow-none']} />
    <Section title="Drop shadow scale">
      <div className="flex gap-4 flex-wrap p-4" style={{ background: '#e2e8f0', borderRadius: 8 }}>
        {['drop-shadow-sm','drop-shadow','drop-shadow-md','drop-shadow-lg','drop-shadow-xl'].map(cls => (
          <div key={cls} className="demo-col">
            <div className={`w-12 h-12 bg-sky-400 rounded-lg ${cls}`}></div>
            <div className="label" style={{ color: '#475569' }}>{cls.replace('drop-shadow-','') || 'DEFAULT'}</div>
          </div>
        ))}
      </div>
    </Section>
  </>
)

const BackdropBlur = ({ cc }) => (
  <>
    <PageHeader title="Backdrop Blur" desc="Blurs the content behind an element — frosted glass effect." />
    <QR cc={cc} classes={['backdrop-blur-none','backdrop-blur-sm','backdrop-blur','backdrop-blur-md','backdrop-blur-lg','backdrop-blur-xl','backdrop-blur-2xl','backdrop-blur-3xl']} />
    <Section title="Frosted glass effect">
      <div className="flex gap-3 flex-wrap">
        {['backdrop-blur-sm','backdrop-blur','backdrop-blur-md','backdrop-blur-xl'].map(cls => (
          <div key={cls} className="demo-col">
            <div className="relative w-24 h-20 rounded overflow-hidden" style={{ background: 'linear-gradient(135deg,#38bdf8 0%,#818cf8 50%,#f472b6 100%)' }}>
              <div className={`${cls} bg-white/20 absolute inset-1 rounded flex items-center justify-center text-white text-xs font-bold`}>{cls.replace('backdrop-blur-','') || 'DEFAULT'}</div>
            </div>
            <div className="label">{cls.replace('backdrop-blur-','') || 'DEFAULT'}</div>
          </div>
        ))}
      </div>
    </Section>
  </>
)

// ── Colors ────────────────────────────────────────────────────────────────────
const FillStroke = ({ cc }) => (
  <>
    <PageHeader title="Fill & Stroke" desc="Controls the fill and stroke colors of SVG elements." />
    <QR cc={cc} classes={['fill-sky-400','fill-violet-400','fill-emerald-400','fill-none','stroke-sky-400','stroke-violet-400','stroke-emerald-400','stroke-none','stroke-0','stroke-1','stroke-2']} />
    <Section title="Fill colors">
      <div className="flex gap-3 flex-wrap">
        {['fill-sky-400','fill-violet-400','fill-emerald-400','fill-amber-400','fill-rose-400'].map(cls => (
          <div key={cls} className="demo-col">
            <svg className={`w-10 h-10 ${cls}`} viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/></svg>
            <div className="label">{cls.replace('fill-','')}</div>
          </div>
        ))}
      </div>
    </Section>
    <Section title="Stroke colors + width">
      <div className="flex gap-3 flex-wrap">
        {['stroke-sky-400','stroke-violet-400','stroke-emerald-400'].map(cls => (
          <div key={cls} className="demo-col">
            <svg className={`w-10 h-10 fill-none ${cls} stroke-2`} viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/></svg>
            <div className="label">{cls.replace('stroke-','')}</div>
          </div>
        ))}
        {['stroke-0','stroke-1','stroke-2'].map(cls => (
          <div key={cls} className="demo-col">
            <svg className={`w-10 h-10 fill-none stroke-sky-400 ${cls}`} viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/></svg>
            <div className="label">{cls}</div>
          </div>
        ))}
      </div>
    </Section>
  </>
)

const CaretAccent = ({ cc }) => (
  <>
    <PageHeader title="Caret & Accent Color" desc="Controls the text input caret color and form control accent color." />
    <QR cc={cc} classes={['caret-sky-400','caret-violet-400','caret-emerald-400','caret-red-400','accent-sky-400','accent-violet-400','accent-emerald-400','accent-auto']} />
    <Section title="Caret color" note="Click each input — the caret uses the specified color.">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {['caret-sky-400','caret-violet-400','caret-emerald-400'].map(cls => (
          <input key={cls} type="text" placeholder={cls} className={`${cls} bg-slate-700 border border-slate-500 rounded px-3 py-1.5 text-sm text-slate-200 outline-none`} style={{ maxWidth: 220 }} />
        ))}
      </div>
    </Section>
    <Section title="Accent color" note="Controls checkbox, radio, and range input colors.">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {['accent-sky-400','accent-violet-400','accent-emerald-400'].map(cls => (
          <label key={cls} className="flex items-center gap-3 text-sm text-slate-300">
            <input type="checkbox" className={cls} defaultChecked />
            <input type="radio" className={cls} defaultChecked readOnly />
            <span>{cls}</span>
          </label>
        ))}
      </div>
    </Section>
  </>
)

// ── Interactivity ─────────────────────────────────────────────────────────────
const Cursor = ({ cc }) => {
  const cursors = ['cursor-auto','cursor-default','cursor-pointer','cursor-wait','cursor-text','cursor-move','cursor-help','cursor-not-allowed','cursor-none','cursor-progress','cursor-cell','cursor-crosshair','cursor-grab','cursor-grabbing','cursor-col-resize','cursor-row-resize','cursor-zoom-in','cursor-zoom-out']
  return (
    <>
      <PageHeader title="Cursor" desc="Controls the mouse cursor style when hovering over an element." />
      <QR cc={cc} classes={cursors} />
      <Section title="Hover each tile to see the cursor">
        <div className="flex flex-wrap gap-2">
          {cursors.map(cls => (
            <div key={cls} className={`${cls} bg-slate-700 hover:bg-slate-600 border border-slate-500 rounded px-3 py-2 text-xs text-slate-300 text-center`} style={{ minWidth: 110 }}>
              {cls.replace('cursor-','')}
              <div className="label">hover me</div>
            </div>
          ))}
        </div>
      </Section>
    </>
  )
}

const PointerEvents = ({ cc }) => (
  <>
    <PageHeader title="Pointer Events" desc="Controls whether an element can be the target of pointer events." />
    <QR cc={cc} classes={['pointer-events-none','pointer-events-auto']} />
    <Section title="pointer-events-none vs auto">
      <div className="flex gap-4">
        <div className="demo-col">
          <button className="pointer-events-auto bg-sky-500 hover:bg-sky-400 text-white text-sm px-4 py-2 rounded cursor-pointer"
            onClick={e => e.target.textContent = 'Clicked!'}>pointer-events-auto</button>
          <div className="label">clickable</div>
        </div>
        <div className="demo-col">
          <button className="pointer-events-none bg-slate-600 text-slate-400 text-sm px-4 py-2 rounded">pointer-events-none</button>
          <div className="label">not clickable</div>
        </div>
      </div>
    </Section>
  </>
)

const UserSelect = ({ cc }) => (
  <>
    <PageHeader title="User Select" desc="Controls whether the user can select text." />
    <QR cc={cc} classes={['select-none','select-text','select-all','select-auto']} />
    <Section title="Try to select the text in each box">
      <div className="flex gap-3 flex-wrap">
        {['select-none','select-text','select-all','select-auto'].map(cls => (
          <div key={cls} className="demo-col" style={{ maxWidth: 140 }}>
            <div className={`${cls} bg-slate-700 border border-slate-500 rounded px-3 py-2 text-sm text-slate-200`}>Try selecting this text</div>
            <div className="label">{cls}</div>
          </div>
        ))}
      </div>
    </Section>
  </>
)

const Resize = ({ cc }) => (
  <>
    <PageHeader title="Resize" desc="Controls how an element can be resized by the user." />
    <QR cc={cc} classes={['resize-none','resize-y','resize-x','resize']} />
    <Section title="Drag the corners to resize">
      <div className="flex gap-3 flex-wrap">
        {['resize-none','resize-y','resize-x','resize'].map(cls => (
          <div key={cls} className="demo-col">
            <textarea className={`${cls} bg-slate-700 border border-slate-500 rounded p-2 text-sm text-slate-300 overflow-auto`}
              style={{ width: 120, height: 80 }} placeholder={cls} readOnly />
            <div className="label">{cls}</div>
          </div>
        ))}
      </div>
    </Section>
  </>
)

const ScrollSnap = ({ cc }) => (
  <>
    <PageHeader title="Scroll Snap" desc="Controls how scroll snapping works in a scroll container." />
    <QR cc={cc} classes={['snap-x','snap-y','snap-both','snap-none','snap-mandatory','snap-proximity','snap-start','snap-center','snap-end','snap-align-none','snap-normal','snap-always']} />
    <Section title="Horizontal scroll snap" note="Scroll left/right — each card snaps into place.">
      <div className="flex snap-x snap-mandatory overflow-x-auto gap-3 pb-2" style={{ maxWidth: 320 }}>
        {[['sky','Card 1'],['violet','Card 2'],['emerald','Card 3'],['amber','Card 4'],['rose','Card 5']].map(([c,l]) => (
          <div key={l} className={`snap-center shrink-0 w-64 h-28 rounded-lg bg-${c}-400 flex items-center justify-center text-white font-bold text-lg`}>{l}</div>
        ))}
      </div>
    </Section>
  </>
)

const ScreenReader = ({ cc }) => (
  <>
    <PageHeader title="Screen Reader" desc="Hides elements visually while keeping them accessible to screen readers." />
    <QR cc={cc} classes={['sr-only','not-sr-only']} />
    <Section title="sr-only" note="The label is hidden visually but present in the DOM for screen readers.">
      <div className="flex items-center gap-4">
        <button className="bg-sky-500 text-white text-sm px-4 py-2 rounded flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.83A4 4 0 019 17H7v-2a4 4 0 012.172-3.586z"/>
          </svg>
          <span className="sr-only">Edit profile</span>
        </button>
        <span className="text-sm text-slate-400">← has sr-only label, invisible but accessible</span>
      </div>
    </Section>
    <Section title="not-sr-only" note="Reverses sr-only to make content visible again.">
      <span className="sr-only not-sr-only text-sky-400 text-sm font-semibold">Now visible with not-sr-only</span>
    </Section>
  </>
)

// ── Registry ──────────────────────────────────────────────────────────────────
// maps page id → { component, classes[] for stats }
export const PAGES = {
  'preflight':         { component: Preflight,       classes: ['block','m-0','p-0','border-0'] },
  'display':           { component: Display,         classes: ['block','inline-block','inline','flex','inline-flex','grid','inline-grid','hidden','contents','flow-root','table','table-row','table-cell','list-item'] },
  'position':          { component: Position,        classes: ['static','fixed','absolute','relative','sticky'] },
  'inset':             { component: Inset,            classes: ['top-0','top-2','top-4','right-0','right-4','bottom-0','bottom-4','left-0','left-4','inset-0','inset-4','inset-x-4','inset-y-4','-top-2','-left-2'] },
  'visibility':        { component: Visibility,      classes: ['visible','invisible','collapse'] },
  'overflow':          { component: Overflow,        classes: ['overflow-auto','overflow-hidden','overflow-visible','overflow-scroll','overflow-x-auto','overflow-x-hidden','overflow-y-auto','overflow-y-hidden','overflow-x-scroll','overflow-y-scroll'] },
  'overscroll':        { component: Overscroll,      classes: ['overscroll-auto','overscroll-contain','overscroll-none','overscroll-x-auto','overscroll-x-contain','overscroll-y-contain'] },
  'z-index':           { component: ZIndex,          classes: ['z-0','z-10','z-20','z-30','z-40','z-50','-z-10'] },
  'float':             { component: Float,           classes: ['float-left','float-right','float-none','clear-left','clear-right','clear-both','clear-none'] },
  'isolation':         { component: Isolation,       classes: ['isolate','isolation-auto'] },
  'object-fit':        { component: ObjectFit,       classes: ['object-contain','object-cover','object-fill','object-none','object-scale-down'] },
  'object-position':   { component: ObjectPosition,  classes: ['object-center','object-top','object-bottom','object-left','object-right','object-left-top','object-left-bottom','object-right-top','object-right-bottom'] },
  'aspect-ratio':      { component: AspectRatio,     classes: ['aspect-auto','aspect-square','aspect-video','aspect-[4/3]'] },
  'columns':           { component: Columns,         classes: ['columns-1','columns-2','columns-3','columns-4','columns-auto'] },
  'box-sizing':        { component: BoxSizing,       classes: ['box-border','box-content'] },
  'break':             { component: Break,           classes: ['break-after-auto','break-after-all','break-after-avoid','break-before-auto','break-inside-auto','break-inside-avoid','box-decoration-break-clone','box-decoration-break-slice'] },
  'padding':           { component: Padding,         classes: ['p-0','p-1','p-2','p-4','p-6','p-8','px-4','py-4','pt-4','pr-4','pb-4','pl-4','p-px'] },
  'margin':            { component: Margin,          classes: ['m-0','m-1','m-2','m-4','m-6','m-8','mx-4','my-4','mt-4','mr-4','mb-4','ml-4','m-auto','mx-auto','-m-2','-mt-2'] },
  'space-between':     { component: SpaceBetween,    classes: ['space-x-1','space-x-2','space-x-4','space-x-8','space-y-1','space-y-2','space-y-4','space-y-8','space-x-reverse','space-y-reverse'] },
  'width':             { component: Width,           classes: ['w-0','w-px','w-1','w-4','w-8','w-16','w-32','w-64','w-auto','w-full','w-screen','w-fit','w-min','w-max','w-1/2','w-1/3','w-2/3','w-1/4','w-3/4','w-[200px]','w-[50%]'] },
  'height':            { component: Height,          classes: ['h-0','h-px','h-1','h-4','h-8','h-16','h-32','h-64','h-auto','h-full','h-fit','h-min','h-max','h-[100px]'] },
  'size':              { component: Size,            classes: ['size-4','size-8','size-12','size-16','size-24','size-32','size-full','size-auto','size-[50px]'] },
  'min-width':         { component: MinWidth,        classes: ['min-w-0','min-w-4','min-w-8','min-w-16','min-w-full','min-w-min','min-w-max','min-w-fit','min-w-[100px]'] },
  'max-width':         { component: MaxWidth,        classes: ['max-w-xs','max-w-sm','max-w-md','max-w-lg','max-w-xl','max-w-2xl','max-w-full','max-w-none','max-w-prose'] },
  'min-height':        { component: MinHeight,       classes: ['min-h-0','min-h-4','min-h-8','min-h-16','min-h-full','min-h-screen','min-h-min','min-h-max','min-h-fit','min-h-[80px]'] },
  'max-height':        { component: MaxHeight,       classes: ['max-h-0','max-h-4','max-h-8','max-h-32','max-h-64','max-h-full','max-h-screen','max-h-none','max-h-[120px]'] },
  'font-family':       { component: FontFamily,      classes: ['font-sans','font-serif','font-mono'] },
  'font-size':         { component: FontSize,        classes: ['text-xs','text-sm','text-base','text-lg','text-xl','text-2xl','text-3xl','text-4xl','text-5xl'] },
  'font-smoothing':    { component: FontSmoothing,   classes: ['antialiased','subpixel-antialiased'] },
  'font-style':        { component: FontStyle,       classes: ['italic','not-italic'] },
  'font-weight':       { component: FontWeight,      classes: ['font-thin','font-extralight','font-light','font-normal','font-medium','font-semibold','font-bold','font-extrabold','font-black'] },
  'letter-spacing':    { component: LetterSpacing,   classes: ['tracking-tighter','tracking-tight','tracking-normal','tracking-wide','tracking-wider','tracking-widest'] },
  'line-height':       { component: LineHeight,      classes: ['leading-none','leading-tight','leading-snug','leading-normal','leading-relaxed','leading-loose','leading-3','leading-4','leading-5','leading-6'] },
  'line-clamp':        { component: LineClamp,       classes: ['line-clamp-1','line-clamp-2','line-clamp-3','line-clamp-4','line-clamp-none'] },
  'text-align':        { component: TextAlign,       classes: ['text-left','text-center','text-right','text-justify','text-start','text-end'] },
  'text-color':        { component: TextColor,       classes: ['text-slate-400','text-red-400','text-green-400','text-sky-400','text-blue-400','text-violet-400','text-white','text-black','text-sky-400/75','text-sky-400/50'] },
  'text-decoration':   { component: TextDecoration,  classes: ['underline','overline','line-through','no-underline','decoration-solid','decoration-dashed','decoration-dotted','decoration-double','decoration-wavy','decoration-1','decoration-2','decoration-4','decoration-sky-400'] },
  'text-transform':    { component: TextTransform,   classes: ['uppercase','lowercase','capitalize','normal-case'] },
  'text-overflow':     { component: TextOverflow,    classes: ['truncate','overflow-ellipsis','overflow-clip','text-ellipsis','text-clip'] },
  'text-wrap':         { component: TextWrap,        classes: ['text-wrap','text-nowrap','text-balance','text-pretty'] },
  'whitespace':        { component: Whitespace,      classes: ['whitespace-normal','whitespace-nowrap','whitespace-pre','whitespace-pre-line','whitespace-pre-wrap','whitespace-break-spaces'] },
  'word-break':        { component: WordBreak,       classes: ['break-normal','break-words','break-all','break-keep'] },
  'vertical-align':    { component: VerticalAlign,   classes: ['align-baseline','align-top','align-middle','align-bottom','align-text-top','align-text-bottom','align-sub','align-super'] },
  'flex-basis':        { component: FlexBasis,       classes: ['basis-0','basis-1','basis-4','basis-8','basis-16','basis-32','basis-auto','basis-full','basis-1/2','basis-1/3','basis-1/4'] },
  'flex-direction':    { component: FlexDirection,   classes: ['flex-row','flex-row-reverse','flex-col','flex-col-reverse'] },
  'flex-wrap':         { component: FlexWrap,        classes: ['flex-wrap','flex-nowrap','flex-wrap-reverse'] },
  'flex':              { component: Flex,            classes: ['flex-1','flex-auto','flex-initial','flex-none'] },
  'flex-grow':         { component: FlexGrow,        classes: ['grow','grow-0','shrink','shrink-0'] },
  'order':             { component: Order,           classes: ['order-1','order-2','order-3','order-first','order-last','order-none'] },
  'grid-cols':         { component: GridCols,        classes: ['grid-cols-1','grid-cols-2','grid-cols-3','grid-cols-4','grid-cols-6','grid-cols-12','grid-cols-none'] },
  'grid-rows':         { component: GridRows,        classes: ['grid-rows-1','grid-rows-2','grid-rows-3','grid-rows-4','grid-rows-none'] },
  'grid-column':       { component: GridColumn,      classes: ['col-span-1','col-span-2','col-span-3','col-span-4','col-span-6','col-span-full','col-auto','col-start-1','col-start-2','col-end-3'] },
  'grid-row':          { component: GridRow,         classes: ['row-span-1','row-span-2','row-span-3','row-span-full','row-auto','row-start-1','row-start-2','row-end-3'] },
  'grid-flow':         { component: GridFlow,        classes: ['grid-flow-row','grid-flow-col','grid-flow-dense','grid-flow-row-dense','grid-flow-col-dense'] },
  'gap':               { component: Gap,             classes: ['gap-0','gap-px','gap-1','gap-2','gap-4','gap-6','gap-8','gap-x-4','gap-y-4'] },
  'justify-content':   { component: JustifyContent,  classes: ['justify-start','justify-end','justify-center','justify-between','justify-around','justify-evenly','justify-stretch','justify-normal'] },
  'justify-items':     { component: JustifyItems,    classes: ['justify-items-start','justify-items-end','justify-items-center','justify-items-stretch','justify-items-normal'] },
  'align-content':     { component: AlignContent,    classes: ['content-normal','content-center','content-start','content-end','content-between','content-around','content-evenly','content-stretch','content-baseline'] },
  'align-items':       { component: AlignItems,      classes: ['items-start','items-end','items-center','items-baseline','items-stretch'] },
  'align-self':        { component: AlignSelf,       classes: ['self-auto','self-start','self-end','self-center','self-stretch','self-baseline'] },
  'place-content':     { component: PlaceContent,    classes: ['place-content-center','place-content-start','place-content-end','place-content-between','place-content-around','place-content-evenly','place-content-stretch'] },
  'border-radius':     { component: BorderRadius,    classes: ['rounded-none','rounded-sm','rounded','rounded-md','rounded-lg','rounded-xl','rounded-2xl','rounded-3xl','rounded-full','rounded-t','rounded-r','rounded-b','rounded-l'] },
  'border-width':      { component: BorderWidth,     classes: ['border','border-0','border-2','border-4','border-8','border-t','border-r','border-b','border-l','border-t-2','border-b-2','border-x','border-y','border-x-2','border-y-2'] },
  'border-color':      { component: BorderColor,     classes: ['border-slate-400','border-red-400','border-green-400','border-sky-400','border-blue-400','border-violet-400','border-pink-400','border-sky-400/50'] },
  'border-style':      { component: BorderStyle,     classes: ['border-solid','border-dashed','border-dotted','border-double','border-none'] },
  'divide-width':      { component: DivideWidth,     classes: ['divide-x','divide-x-2','divide-x-4','divide-y','divide-y-2','divide-y-4','divide-x-reverse','divide-y-reverse'] },
  'divide-color':      { component: DivideColor,     classes: ['divide-sky-400','divide-red-400','divide-green-400','divide-violet-400','divide-amber-400','divide-sky-400/50'] },
  'divide-style':      { component: DivideStyle,     classes: ['divide-solid','divide-dashed','divide-dotted','divide-double','divide-none'] },
  'outline':           { component: Outline,         classes: ['outline','outline-none','outline-solid','outline-dashed','outline-dotted','outline-0','outline-2','outline-4','outline-sky-400','outline-red-400','outline-offset-0','outline-offset-2','outline-offset-4','outline-offset-8'] },
  'box-shadow':        { component: BoxShadow,       classes: ['shadow-sm','shadow','shadow-md','shadow-lg','shadow-xl','shadow-2xl','shadow-inner','shadow-none','shadow-[4px_4px_0_0]','shadow-black','shadow-sky-400'] },
  'opacity':           { component: Opacity,         classes: ['opacity-0','opacity-5','opacity-10','opacity-25','opacity-50','opacity-75','opacity-90','opacity-100'] },
  'ring':              { component: Ring,            classes: ['ring','ring-0','ring-1','ring-2','ring-4','ring-8','ring-inset','ring-sky-400','ring-red-400','ring-offset-0','ring-offset-2','ring-offset-4','ring-offset-sky-400'] },
  'text-shadow':       { component: TextShadow,      classes: ['text-shadow-sm','text-shadow','text-shadow-md','text-shadow-lg','text-shadow-none','text-shadow-sky-400'] },
  'bg-color':          { component: BgColor,         classes: ['bg-slate-500','bg-red-500','bg-sky-500','bg-blue-500','bg-violet-500','bg-white','bg-black','bg-sky-400/75','bg-sky-400/50'] },
  'bg-image':          { component: BgImage,         classes: ['bg-none','bg-linear-to-t','bg-linear-to-r','bg-linear-to-b','bg-linear-to-br','bg-linear-to-tl'] },
  'bg-size':           { component: BgSize,          classes: ['bg-auto','bg-cover','bg-contain'] },
  'bg-position':       { component: BgPosition,      classes: ['bg-bottom','bg-center','bg-left','bg-right','bg-top','bg-left-bottom','bg-left-top','bg-right-bottom','bg-right-top'] },
  'bg-repeat':         { component: BgRepeat,        classes: ['bg-repeat','bg-no-repeat','bg-repeat-x','bg-repeat-y','bg-repeat-round','bg-repeat-space'] },
  'bg-clip':           { component: BgClip,          classes: ['bg-clip-border','bg-clip-padding','bg-clip-content','bg-clip-text'] },
  'gradient':          { component: Gradient,        classes: ['from-sky-400','from-violet-500','via-purple-500','to-blue-500','to-pink-500','from-sky-400/50'] },
  'scale':             { component: Scale,           classes: ['scale-50','scale-75','scale-90','scale-100','scale-105','scale-110','scale-125','scale-150','scale-x-75','scale-y-75','-scale-x-100'] },
  'rotate':            { component: Rotate,          classes: ['rotate-0','rotate-1','rotate-2','rotate-3','rotate-6','rotate-12','rotate-45','rotate-90','rotate-180','-rotate-45','-rotate-90'] },
  'translate':         { component: Translate,       classes: ['translate-x-0','translate-x-2','translate-x-4','translate-x-8','translate-y-4','translate-y-8','-translate-x-4','-translate-y-4','translate-x-[20px]'] },
  'skew':              { component: Skew,            classes: ['skew-x-0','skew-x-3','skew-x-6','skew-x-12','skew-y-0','skew-y-6','-skew-x-6','-skew-y-6'] },
  'transform-origin':  { component: TransformOrigin, classes: ['origin-center','origin-top','origin-top-right','origin-right','origin-bottom-right','origin-bottom','origin-bottom-left','origin-left','origin-top-left'] },
  'transition':        { component: Transition,      classes: ['transition','transition-all','transition-colors','transition-opacity','transition-shadow','transition-transform','transition-none'] },
  'duration':          { component: Duration,        classes: ['duration-75','duration-100','duration-150','duration-200','duration-300','duration-500','duration-700','duration-1000'] },
  'timing-function':   { component: TimingFunction,  classes: ['ease-linear','ease-in','ease-out','ease-in-out'] },
  'delay':             { component: Delay,           classes: ['delay-0','delay-75','delay-100','delay-150','delay-200','delay-300','delay-500','delay-700','delay-1000'] },
  'animation':         { component: Animation,       classes: ['animate-spin','animate-ping','animate-pulse','animate-bounce','animate-none'] },
  'blur':              { component: Blur,            classes: ['blur-none','blur-sm','blur','blur-md','blur-lg','blur-xl','blur-2xl','blur-3xl','blur-[2px]','backdrop-blur-none','backdrop-blur-sm','backdrop-blur','backdrop-blur-md','backdrop-blur-lg'] },
  'brightness':        { component: Brightness,      classes: ['brightness-0','brightness-50','brightness-75','brightness-100','brightness-110','brightness-125','brightness-150','brightness-200','backdrop-brightness-50','backdrop-brightness-100','backdrop-brightness-150'] },
  'contrast':          { component: Contrast,        classes: ['contrast-0','contrast-50','contrast-75','contrast-100','contrast-125','contrast-150','contrast-200','backdrop-contrast-50','backdrop-contrast-100','backdrop-contrast-150'] },
  'grayscale':         { component: Grayscale,       classes: ['grayscale-0','grayscale','grayscale-50','backdrop-grayscale-0','backdrop-grayscale'] },
  'hue-rotate':        { component: HueRotate,       classes: ['hue-rotate-0','hue-rotate-15','hue-rotate-30','hue-rotate-60','hue-rotate-90','hue-rotate-180','-hue-rotate-30','-hue-rotate-90','backdrop-hue-rotate-90'] },
  'invert':            { component: Invert,          classes: ['invert-0','invert','invert-50','backdrop-invert-0','backdrop-invert'] },
  'saturate':          { component: Saturate,        classes: ['saturate-0','saturate-50','saturate-100','saturate-150','saturate-200','backdrop-saturate-50','backdrop-saturate-100','backdrop-saturate-200'] },
  'sepia':             { component: Sepia,           classes: ['sepia-0','sepia','sepia-50','backdrop-sepia-0','backdrop-sepia'] },
  'drop-shadow':       { component: DropShadow,      classes: ['drop-shadow-sm','drop-shadow','drop-shadow-md','drop-shadow-lg','drop-shadow-xl','drop-shadow-2xl','drop-shadow-none'] },
  'backdrop-blur':     { component: BackdropBlur,    classes: ['backdrop-blur-none','backdrop-blur-sm','backdrop-blur','backdrop-blur-md','backdrop-blur-lg','backdrop-blur-xl','backdrop-blur-2xl'] },
  'fill-stroke':       { component: FillStroke,      classes: ['fill-sky-400','fill-violet-400','fill-none','stroke-sky-400','stroke-violet-400','stroke-none','stroke-0','stroke-1','stroke-2'] },
  'caret-accent':      { component: CaretAccent,     classes: ['caret-sky-400','caret-violet-400','caret-emerald-400','accent-sky-400','accent-violet-400','accent-auto'] },
  'cursor':            { component: Cursor,          classes: ['cursor-auto','cursor-default','cursor-pointer','cursor-wait','cursor-text','cursor-move','cursor-help','cursor-not-allowed','cursor-none','cursor-progress','cursor-grab','cursor-zoom-in','cursor-zoom-out'] },
  'pointer-events':    { component: PointerEvents,   classes: ['pointer-events-none','pointer-events-auto'] },
  'user-select':       { component: UserSelect,      classes: ['select-none','select-text','select-all','select-auto'] },
  'resize':            { component: Resize,          classes: ['resize-none','resize-y','resize-x','resize'] },
  'scroll-snap':       { component: ScrollSnap,      classes: ['snap-x','snap-y','snap-both','snap-none','snap-mandatory','snap-proximity','snap-start','snap-center','snap-end','snap-align-none'] },
  'screen-reader':     { component: ScreenReader,    classes: ['sr-only','not-sr-only'] },
}
