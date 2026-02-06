import React, { JSX } from 'react'

type Props = {
    name: string;
    buttonComponent?: JSX.Element; 
    isSmallText?: boolean
}

const Header = ({name, buttonComponent, isSmallText=false}: Props) => {
    
  return (
    <div className='mb-5 md:flex w-full items-center justify-between'>
        <h1 className={` ${isSmallText ? "text-lg" : "text-2xl"} font-semibold dark:text-white `}>
            {name}
        </h1>
        {buttonComponent}
    </div>
  )
}

export default Header