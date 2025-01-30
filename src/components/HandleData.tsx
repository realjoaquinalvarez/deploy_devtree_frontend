import { useState } from "react";
import { SocialNetwork, UserHandle } from "../types/index";

type HandleDataProps = {
    data: UserHandle;
};

export default function HandleData({ data }: HandleDataProps) {
    const [loaded, setLoaded] = useState(false);

    const links: SocialNetwork[] = JSON.parse(data.links).filter((link: SocialNetwork) => link.enabled)

    return (
        <div className="space-y-6 text-white">
            <p className="text-5xl text-center font-black">{data.handle}</p>

            {data.image && (
                <img
                    src={data.image}
                    alt="Imagen del usuario"
                    className={`max-w-[250px] mx-auto transition-opacity rounded-xl duration-30 ${loaded ? "opacity-100" : "opacity-0"
                        }`}
                    onLoad={() => setLoaded(true)}
                    loading="lazy"
                />
            )}

            <p className="text-lg text-center font-bold">{data.description}</p>
            <div className="mt-20 flex flex-col gap-6 w-auto">
                {links.length
                    ? links.map(link => (
                        <a 
                            key={link.name}
                            className="bg-white px-5 py-2 flex items-center gap-5 rounded-lg"
                            href={link.url}
                            target="_blank"
                            rel="nonreferrer noopener"
                        >
                            <img src={`social/icon_${link.name}.svg`} alt="imagen red social"  className="w-12"/>
                            <p className="text-black capitalize font-bold text-lg">Visita mi: {link.name}</p>
                        </a>
                    ))

                    
                    : <p className="h-10 w-72 content-center text-center bg-black text-bold rounded-xl text-white"> No hay enlaces en este perfil </p>
                }
            </div>


        </div>
    );
}
