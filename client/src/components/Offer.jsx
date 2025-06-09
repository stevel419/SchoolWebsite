import { useState } from "react";

const OfferContents1 = () => {
    return (
        <ul className="list-inside list-disc py-2">
            <li className="pb-2">
                Develops not just intellectual abilities but also character, virtues, and a sense of purpose.
            </li>
            <li>
                Encourages students to see their education as a means to serve God and humanity.
            </li>
        </ul>
    );
}

const OfferContents2 = () => {
    return (
        <ul className="list-inside list-disc py-2">
            <li className="pb-2">
                Maintains a structured environment that emphasizes self-discipline, respect for teachers, and
                obedience to God.
            </li>
            <li>
                An alternative to schools where discipline is lacking.
            </li>
        </ul>
    );
}

const OfferContents3 = () => {
    return (
        <ul className="list-inside list-disc py-2">
            <li className="pb-2">
                Provides a protective space against negative influences (e.g., substance abuse, violence, or
                radical ideologies).
            </li>
            <li>
                Teachers and staff act as role models in faith and virtue.
            </li>
        </ul>
    );
}

function Offer() {
    const [openMenu1, setOpenMenu1] = useState(false);
    const [openMenu2, setOpenMenu2] = useState(false);
    const [openMenu3, setOpenMenu3] = useState(false);

    return (
        <div className="bg-emerald-700/75 py-10 shadow-xl">
            <h2 className="flex justify-center pt-10 font-bold text-3xl uppercase">What we offer</h2>
            <div className="flex flex-col lg:flex-row gap-10 px-10 py-10 lg:items-start">
                <div className="border-y-2 p-4 rounded-xl bg-white flex-1 text-lg">
                    <button onClick={() => setOpenMenu1((prev) => !prev)} 
                    className="flex justify-between items-center w-full text-left font-bold text-emerald-700">
                        <span>Holistic Formation</span>
                        <span className="text-right text-xl">{ openMenu1 ? '-' : '+' }</span>
                    </button>
                    { openMenu1 && <OfferContents1 /> }
                </div>
                <div className="border-y-2 p-4 rounded-xl bg-white flex-1 text-lg">
                    <button onClick={() => setOpenMenu2((prev) => !prev)}
                    className="flex justify-between items-center w-full text-left font-bold text-emerald-700">
                        <span>Discipline and Respect for Authority</span>
                        <span className="text-right text-xl">{ openMenu2 ? '-' : '+' }</span>
                    </button>
                    { openMenu2 && <OfferContents2 /> }
                </div>
                <div className="border-y-2 p-4 rounded-xl bg-white flex-1 text-lg">
                    <button onClick={() => setOpenMenu3((prev) => !prev)}
                    className="flex justify-between items-center w-full text-left font-bold text-emerald-700">
                        <span className="text-lg">Safe and Nurturing Environment</span>
                        <span className="text-right text-xl">{ openMenu3 ? '-' : '+' }</span>
                    </button>
                    { openMenu3 && <OfferContents3 /> }
                </div>
            </div>
        </div>
    );
}

export default Offer;