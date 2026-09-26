import Image from "next/image";

const reviews = [
  "Amber was fantastic to work with, her high spirits and superb organization skills made planning an ever-changing and morphing event a breeze.",
  "There aren’t enough great things to say about Amber! I was looking for someone to help bring my proposal vision to life while staying within my budget, and she exceeded every expectation. She was professional, easy to reach, and truly understood what I wanted.",
  "I have had the privilege and benefit of working with Amber Walker Events on multiple occasions. She has planned numerous events for my company, my family, my clients and friends.",
];

const clientLogos = [
  ["Amazon", "/media/home/1a6711-1bda9be0dc3348fab3dbcb7e02158cd2-mv2-a286d27a53.png"],
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
  ["RioCan", "/media/home/1a6711-b576485c34b74b838c0065558d5ff851-mv2-8e5ff4592d.png"],
  ["MPAC", "/media/home/1a6711-a6e940e747434c04a116b183b6420b7b-mv2-03cce5e9b8.png"],
  ["Certain Affinity", "/media/home/1a6711-83bc1d3cff06461fa008c72e20d5c253-mv2-ca018cacb0.png"],
] as const;

export function GoodCompanySection() {
  return <section className="trusted-section" data-home-section="good-company">
    <h2>YOUR IN GOOD COMPANY</h2>
    <p>TRUSTED BY CLIENTS ACROSS EVERY TYPE OF CELEBRATION</p>
    <div className="brand-flow" aria-label="Featured clients"><div>{[...clientLogos, ...clientLogos].map(([alt, src], index) => <span key={`${src}-${index}`}><Image src={src} alt={alt} fill sizes="220px" loading="eager" unoptimized /></span>)}</div></div>
    <div className="review-flow">{reviews.map((review) => <blockquote key={review}><span className="review-rule" aria-hidden="true" /><span className="review-quote" aria-hidden="true">“</span><span className="review-stars" aria-label="5 out of 5 stars">★★★★★</span><p>{review}</p></blockquote>)}</div>
  </section>;
}
