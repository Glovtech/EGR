'use client';

import { SectionHeading } from './ui';

const TESTIMONIALS = [
  {
    name: 'Mrs. Abena K.',
    location: 'Kumasi',
    text: "My 9-year-old son used to forget almost everything. After 3 weeks with Forever Arctic Sea, his teacher called to say he's more attentive and remembers better!",
    rating: 5,
  },
  {
    name: 'Mr. Kwame T.',
    location: 'Accra',
    text: 'My daughter now explains topics to her friends! Her confidence has grown tremendously, and she actually loves studying now.',
    rating: 5,
  },
  {
    name: 'Grace A.',
    location: 'Takoradi',
    text: "I was surprised when my son's teacher told me he's now one of the most focused kids in class.",
    rating: 5,
  },
  {
    name: 'Josephine M.',
    location: 'Tamale',
    text: 'My daughter is now more focused during homework time. She remembers things better and learns faster. Thank you!',
    rating: 5,
  },
  {
    name: 'Ama K.',
    location: 'Accra',
    text: 'I recommend it to every parent.',
    rating: 4,
  },
];

export const AVERAGE_RATING = (TESTIMONIALS.reduce((s, t) => s + t.rating, 0) / TESTIMONIALS.length).toFixed(1);

function Card({ t }: { t: (typeof TESTIMONIALS)[number] }) {
  return (
    <figure className="flex w-[320px] shrink-0 flex-col justify-between rounded-[1.75rem] bg-white p-8 md:w-[420px]">
      <blockquote className="font-serif text-[1.35rem] leading-snug text-ink md:text-2xl">“{t.text}”</blockquote>
      <figcaption className="mt-8 flex items-baseline justify-between border-t border-line pt-5 text-sm">
        <span className="font-semibold text-ink">{t.name}</span>
        <span className="text-ink/45">{t.location}</span>
      </figcaption>
    </figure>
  );
}

function Row({ reverse = false }: { reverse?: boolean }) {
  const items = reverse ? [...TESTIMONIALS].reverse() : TESTIMONIALS;
  return (
    <div className="marquee-wrap flex overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_6%,black_94%,transparent)]">
      <div className={`marquee flex w-max gap-4 pr-4 ${reverse ? 'marquee-reverse' : ''}`}>
        {[...items, ...items].map((t, i) => (
          <div key={i} aria-hidden={i >= items.length} className="flex">
            <Card t={t} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Testimonials() {
  return (
    <section id="testimonials" className="overflow-hidden py-24 md:py-32">
      <div className="px-5">
        <SectionHeading
          eyebrow="Parents across Ghana"
          title={
            <>
              Real stories from <em>real families</em>
            </>
          }
          sub={`Rated ${AVERAGE_RATING} out of 5 by parents who tried Forever Arctic Sea.`}
        />
      </div>
      <div className="space-y-4">
        <Row />
        <Row reverse />
      </div>
    </section>
  );
}
