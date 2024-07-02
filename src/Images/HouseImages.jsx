import React from "react";

export function importAll(r) {
    return r.keys().map(r);
  }
  

export   const pagrindinisPastatasAntrasAukstasImages = importAll(require.context('./pagrindinisPastatasAntrasAukstas', false, /\.(png|jpe?g|svg)$/));
export   const pagrindinisPastatasPirmasAukstasImages = importAll(require.context('./pagrindinisPastatasPirmasAukstas', false, /\.(png|jpe?g|svg)$/));
export   const mariuAplinkaImages = importAll(require.context('./MariuAplinka', false, /\.(png|jpe?g|svg)$/));
export   const vilosAplinkaImages = importAll(require.context('./VilosAplinka', false, /\.(png|jpe?g|svg)$/));
export   const zvejuNamelisImages = importAll(require.context('./Zvejunamelis', false, /\.(png|jpe?g|svg)$/));
export   const pirtiesPastatasPirmasAukstasImages = importAll(require.context('./pirtiesPastatasPirmasAukstas', false, /\.(png|jpe?g|svg)$/));
export   const pirtiesPastatasAntrasAukstasImages = importAll(require.context('./PirtiesPastatasAntrasAukstas', false, /\.(png|jpe?g|svg)$/));
export   const pirtiesPastatasImages = pirtiesPastatasAntrasAukstasImages.concat(pirtiesPastatasPirmasAukstasImages)
export   const pagrindinisPastatasImages = pagrindinisPastatasAntrasAukstasImages.concat(pagrindinisPastatasPirmasAukstasImages)
  
  
