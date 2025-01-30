import { useEffect, useState } from "react"
import { social } from "../data/social"
import DevTreeInput from "../components/DevTreeInput";
import { isValidUrl } from "../utils";
import { toast } from "sonner";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateProfile } from "../api/DevTreeAPI";
import { SocialNetwork, User } from "../types";

export default function LinkTreeView() {
  // Cargamos "social" en el State
  const [socialListState, setSocialListState] = useState(social)

  // Instancia de QueryClient + Caché Queries=['user']
  /* Caché de ejemplo:
    {
    "_id": "...",
    "handle": "...",
    "name": "...",
    "email": "...",
    "password": "...",
    "description": "...",
    "image": "...",
    "links": [] // (array de objetos con campos como name, url, enabled, id)
    }
  */
  const queryClient = useQueryClient()
  const user: User = queryClient.getQueryData(['user'])!

  // Actualizar caché
  function updateSocialCache(updatedItems: SocialNetwork[]) {
    queryClient.setQueryData(['user'], (prevData: User) => {
      return {
        ...prevData,
        links: JSON.stringify(updatedItems)
      }
    })
  }

  // "Guardar cambios" actualiza la BD
  const { mutate } = useMutation({
    mutationFn: updateProfile,
    onError: (error) => {
      toast.error(error.message)
    },
    onSuccess: () => {
      toast.success('Actualizado Correctamente')
    }
  })

  // Primer setSocialListState con los datos de la BD
  // Actualiza URL y Enabled tomando en cuenta el socialListInBD
  useEffect(() => {
    const updatedData = socialListState.map(social => {

      const socialListInBD = JSON.parse(user.links)
      // Si para el social actual hay un 
      const userlink = socialListInBD.find
        ((socialInBD: SocialNetwork) => socialInBD.name === social.name)

      if (userlink) {
        return { ...social, url: userlink.url, enabled: userlink.enabled }
      }

      return social
    })
    setSocialListState(updatedData)
  }, [])

  // Detectamos input y actualizamos State
  const handleUrlInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Condición: Traer el input.name para detectar el social.name que necesita actualizarse
    const updatedInputState = socialListState.map((social) => social.name === e.target.name
      ? { ...social, url: e.target.value }
      : social)

     // console.log(updatedInputState) objeto con State actualizado
    setSocialListState(updatedInputState)
  }

  // Recuperamos el contenido de "link" de la BD
  const linksList: SocialNetwork[] = JSON.parse(user.links)

  // 1- "Switch" a la red social (SwitchON solo a links correctos)
  // 2- Actualizar state
  // 3- Asignar ID
  const switchEnabled = (clickedSwitchName: string) => {
    // socialListUpdated: Array actualizado ( "social.enabled: true" si es una URL)
    const socialListUpdated = socialListState.map((social) => {
      if (social.name === clickedSwitchName) {
        if (isValidUrl(social.url)) {
          return { ...social, enabled: !social.enabled }
        } else {
          toast('Url no valida')
        }
      } // Else 
      return social
    })

    setSocialListState(socialListUpdated) // Actualizamos State con los ("social.enabled correctos")

    let updatedListBD: SocialNetwork[] = [] // Array para la BD (Solo URLs Válidas)

    // Recuperamos el social clickeado
    const socialClicked = socialListUpdated.find(social => social.name === clickedSwitchName)
    // 1- Activo: Agregar ID y guardar en updatedListBD
    // 2- No-Activo: Links es el array recuperado de la BD, entonces, si enabled:false el .filter no lo incluirá en el array
    if (socialClicked?.enabled) {
      const id = linksList.filter( link => link.id ).length + 1
      if(linksList.some(link => link.name === clickedSwitchName)){
        updatedListBD = linksList.map(link => {
          if( link.name === clickedSwitchName ) {
            return {
              ...link,
              enabled: true,
              id: id
            }
          } else {
            return link
          }
        }) 
      } else {
        const newItem = {
          ...socialClicked,
          id: id
        }
        updatedListBD = [...linksList, newItem]
      }
    } else {
      const indexToUpdate = linksList.findIndex(social => social.name === clickedSwitchName)
      updatedListBD = linksList.map(link => {
        if(link.name === clickedSwitchName) { // Si es el que diste click entonces ID = 0
          return {
            ...link,
            id: 0,
            enabled: false
          }
        } else if (link.id > indexToUpdate && (indexToUpdate !== 0 && link.id === 1)) { // remplazo 2* (1,2,3) -> (0,1,3) -> (0,1, '3' as 2) 
          return {
            ...link,
            id: link.id - 1
          }
        } else { // remplazo 2* (1,2,3)->(0,1,2) -> se mantiene porque ninguno es mayor a indexToUpdate 
          return link
        }
      })
    }

    updateSocialCache(updatedListBD)
    
  }


  return (
    <div className="space-y-5">
      {socialListState.map(item => (
        <DevTreeInput
          key={item.name}
          item={item}
          handleUrlInput={handleUrlInput}
          switchEnabled={switchEnabled}
        />
      ))}
      <button
        className="bg-cyan-400 p-2 text-lg w-full uppercase text-slate-600 rounded-lg font-bold"
        onClick={() => mutate(queryClient.getQueryData(['user'])!)}
      >Guardar cambios</button>
    </div>
  )
}
