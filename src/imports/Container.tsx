import svgPaths from "./svg-x2f9z0e0hk";

function Heading() {
  return (
    <div className="h-[23.996px] relative shrink-0 w-full" data-name="Heading 1">
      <p className="absolute font-['Arial:Bold',sans-serif] leading-[24px] left-0 not-italic text-[#16100a] text-[16px] top-[-1.67px]">Location</p>
    </div>
  );
}

function Paragraph() {
  return (
    <div className="content-stretch flex h-[15.997px] items-start relative shrink-0 w-full" data-name="Paragraph">
      <p className="flex-[1_0_0] font-['Arial:Regular',sans-serif] leading-[16px] min-h-px min-w-px not-italic relative text-[#555] text-[12px] whitespace-pre-wrap">Properties</p>
    </div>
  );
}

function Container1() {
  return (
    <div className="h-[39.993px] relative shrink-0 w-[64.466px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <Heading />
        <Paragraph />
      </div>
    </div>
  );
}

export default function Container() {
  return (
    <div className="content-stretch flex gap-[11.987px] items-center relative size-full" data-name="Container">
      <div className="h-[40px] relative shrink-0 w-[31px]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 31 40">
          <path d={svgPaths.p2367d900} fill="url(#paint0_linear_4002_18)" id="Vector" />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_4002_18" x1="26.4272" x2="14.0044" y1="45.9194" y2="0.382606">
              <stop offset="0.348691" stopColor="#BB8136" />
              <stop offset="1" stopColor="#D5C377" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <Container1 />
    </div>
  );
}