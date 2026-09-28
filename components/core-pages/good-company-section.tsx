import Image from "next/image";

const clientLogos = [
  ["The Oscars", "/media/home/1a6711-d3d5aae352904057b1401aff72a3fcb2-mv2-3d872437b9.png"],
  ["Caesars Palace", "/media/home/1a6711-f31c26c026ae4bd1a2bdaf749fa64362-mv2-b9cb0f5dd7.png"],
  ["Amazon", "/media/home/1a6711-1bda9be0dc3348fab3dbcb7e02158cd2-mv2-a286d27a53.png"],
  ["Lise Watier", "/media/home/1a6711-069932ae4f80464c83a8a2d181ab034a-mv2-dd5db6870c.png"],
  ["Living Luxe Design Show", "/media/home/1a6711-c10ed647934c4f68a87e12b83f7a83ae-mv2-45a32d9885.png"],
  ["FreshBooks", "/media/home/1a6711-6dfeb661409e4fb3b844391913878167-mv2-27c56b4c8c.png"],
  ["K1 Speed", "/media/home/1a6711-d18d3db363e948f9871e947a8d81be12-mv2-d0541e3ad5.png"],
  ["Choice Properties", "/media/home/1a6711-a88c3cd2f1e74c3698809acc82320c2c-mv2-1c0362d617.png"],
  ["TEDx", "/media/home/1a6711-0287c6a77ab24cfcaa32f8061805643c-mv2-a3be24f7d4.png"],
  ["SickKids", "/media/home/1a6711-4c8d88588b7244358ab1eaf8500c582c-mv2-a1c0eb8049.png"],
  ["Publicis Groupe", "/media/home/1a6711-705dce4ffc0e4d4dbfe4664a8c8c7a95-mv2-e5a418a21d.png"],
  ["Medela", "/media/home/1a6711-fbd7c59f986f4abeb3b3c0ae2a4d41c6-mv2-3197769ba6.png"],
  ["Shangri-La", "/media/home/1a6711-594aa0f8f91b429b82ca445a468e19ae-mv2-7150f08498.png"],
  ["Nagarro", "/media/home/1a6711-338b16dd66ae4d05b95f7483594aa353-mv2-bbf24c2936.png"],
  ["Crestview", "/media/home/1a6711-f6258168822a4f4382e39aed2f377d7f-mv2-c321f906a8.png"],
  ["St. Regis", "/media/home/1a6711-0603a6063d1b4830b3b21dca5602929a-mv2-c8acd2cc6d.png"],
  ["RioCan", "/media/home/1a6711-b576485c34b74b838c0065558d5ff851-mv2-8e5ff4592d.png"],
  ["MPAC", "/media/home/1a6711-a6e940e747434c04a116b183b6420b7b-mv2-03cce5e9b8.png"],
  ["Holborn Group", "/media/home/1a6711-d27105b7340948b1b6ecfd3594290673-mv2-497a2e3dcd.png"],
  ["Award-winning client", "/media/home/1a6711-b4b5d72862454c72bb667db2d8f2ebfd-mv2-2365f1ce8f.png"],
  ["Certain Affinity", "/media/home/1a6711-83bc1d3cff06461fa008c72e20d5c253-mv2-ca018cacb0.png"],
  ["Living Luxe", "/media/home/1a6711-9ba142664bea4c81ba5a3b996b6e3e3f-mv2-bdebd8544b.png"],
  ["GIP", "/media/home/1a6711-67f42d08ca084f46bd91f6f94df57732-mv2-3acf3526a6.png"],
  ["#Paid", "/media/home/1a6711-3b94d0108ca54605b218115c876ddd2a-mv2-f409e4479d.png"],
  ["Benjamin Moore", "/media/home/1a6711-2b42fb5f6daf42f09c1a047c944abef5-mv2-3165276712.png"],
] as const;

const testimonialColumns = [
  [
    ["Proposal review from Kelvin in Toronto", "/media/home/display/testimonial-proposal.avif"],
    ["Corporate event review", "/media/home/1a6711-7f6a47e9b25a4ca9a99b0c79fe849a08-mv2-5a23dbc6f0.png"],
    ["Wedding review", "/media/home/1a6711-8d16d6e8114949cdb9c28cdfe1fe4f21-mv2-7f0f8a8654.png"],
    ["Social event review", "/media/home/1a6711-f8b9791d87f849fea4208de4f5c5b07c-mv2-e0f88b6a9b.png"],
  ],
  [
    ["Corporate event review from Amazon", "/media/home/display/testimonial-corporate.avif"],
    ["Proposal review", "/media/home/1a6711-d601fbee668847a9aa070ea57e0e694f-mv2-6a3f77f4b1.png"],
    ["Corporate event review", "/media/home/1a6711-72d3a393a07f4253aa6596e82e8a90aa-mv2-3d6035cf79.png"],
    ["Proposal review", "/media/home/1a6711-463ceebac43a4b4ca919ee828ec62b6c-mv2-0e4f4bdbb8.png"],
  ],
  [
    ["Wedding review from Ken and Marisa in Miami", "/media/home/display/testimonial-wedding.avif"],
    ["Social event review", "/media/home/1a6711-53de0cada6f049b68a190d4bf46b8868-mv2-9bba9c67d2.png"],
    ["Proposal review", "/media/home/1a6711-e89ace914b04462f89e03e0066a3f1e5-mv2-b4e8da8472.png"],
    ["Corporate event review", "/media/home/1a6711-9518354e12da42f5a194334a0ecb962e-mv2-fb4536fc2c.png"],
  ],
] as const;

const testimonialSets = testimonialColumns[0].map((_, index) => testimonialColumns.map((column) => column[index]));

export function GoodCompanySection({ brands = true, heading = true }: { brands?: boolean; heading?: boolean }) {
  return <section className={`trusted-section${brands ? "" : " no-brands"}${heading ? "" : " reviews-only"}`} data-home-section="good-company">
    {heading ? <><h2>YOUR IN GOOD COMPANY</h2><p>TRUSTED BY CLIENTS ACROSS EVERY TYPE OF CELEBRATION</p></> : null}
    {brands ? <div className="brand-flow" aria-label="Featured clients"><div>{[...clientLogos, ...clientLogos].map(([alt, src], index) => <span key={`${src}-${index}`}><Image src={src} alt={alt} fill sizes="185px" /></span>)}</div></div> : null}
    <div className="review-flow" aria-label="Client testimonials"><div className="testimonial-track">
      {[...testimonialSets, testimonialSets[0]].map((set, setIndex) => <div className="testimonial-set" aria-hidden={setIndex === testimonialSets.length || undefined} key={setIndex}>
        {set.map(([alt, src]) => <span className="testimonial-card" key={src}><Image className={setIndex === testimonialSets.length ? "testimonial-loop-slide" : "testimonial-slide"} src={src} alt={setIndex === testimonialSets.length ? "" : alt} fill sizes="(max-width: 767px) 88vw, 33vw" /></span>)}
      </div>)}
    </div></div>
  </section>;
}
