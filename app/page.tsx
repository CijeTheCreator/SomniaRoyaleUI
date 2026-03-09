"use client";
import { Unity, useUnityContext } from "react-unity-webgl";
import { useState, useEffect } from "react";

export default function Home() {
  const [gameStarted, setGameStarted] = useState(false);

  const productSlug = `SomniaRoyaleDraft1`;
  const productName = `Unity Royale`;
  const companyName = `Unity Technologies`;
  const streamingAssetsUrl = `StreamingAssets`;
  const codeUrl = `build/${productSlug}.wasm`;
  const frameworkUrl = `build/${productSlug}.framework.js`;
  const dataUrl = `build/${productSlug}.data`;
  const loaderUrl = `build/${productSlug}.loader.js`;
  const productVersion = "1.1";

  const { unityProvider, isLoaded, loadingProgression, sendMessage } =
    useUnityContext({
      loaderUrl,
      dataUrl,
      frameworkUrl,
      codeUrl,
      streamingAssetsUrl,
      companyName,
      productName,
      productVersion,
    });

  const [playerCardQueue, setPlayerCardQueue] = useState([]);
  const [opponentCardQueue, setOpponentCardQueue] = useState([]);
  const [customOpponentCards, setCustomOpponentCards] = useState([]);

  const [newOpponentCard, setNewOpponentCard] = useState({
    prefabName: "Knight",
    positionX: 0,
    positionY: 0,
    positionZ: 5,
    faction: "Opponent",
    placeableType: "Unit",
    attackType: "Melee",
    targetType: "Both",
    attackRatio: 1.5,
    damagePerAttack: 10,
    attackRange: 1.5,
    hitPoints: 50,
    speed: 3,
  });

  useEffect(() => {
    const handleCardUsed = (event) => {
      const cardData = event.detail;
      console.log("React received card from Unity:", cardData);

      if (cardData.faction === "Player") {
        setPlayerCardQueue((prev) => [...prev, cardData]);
      } else if (cardData.faction === "Opponent") {
        setOpponentCardQueue((prev) => [...prev, cardData]);
      }
    };

    window.addEventListener("CardUsed", handleCardUsed);
    return () => window.removeEventListener("CardUsed", handleCardUsed);
  }, []);

  const sendPlayerCardBack = (index) => {
    const card = playerCardQueue[index];
    console.log("Sending player card back to Unity:", card);
    sendMessage("Managers", "UseCardFromBrowser", JSON.stringify(card));
    setPlayerCardQueue((prev) => prev.filter((_, i) => i !== index));
  };

  const sendOpponentCard = (index) => {
    const card = opponentCardQueue[index];
    console.log("Sending opponent card to Unity:", card);
    sendMessage("GameManager", "UseCardFromBrowser", JSON.stringify(card));
    setOpponentCardQueue((prev) => prev.filter((_, i) => i !== index));
  };

  const createCustomOpponentCard = () => {
    console.log("Creating custom opponent card:", newOpponentCard);
    sendMessage(
      "GameManager",
      "CreateOpponentCardFromBrowser",
      JSON.stringify(newOpponentCard),
    );
    setCustomOpponentCards((prev) => [...prev, { ...newOpponentCard }]);
  };

  const toggleBrowserControl = (enabled) => {
    sendMessage("CPUOpponent", "SetBrowserControl", enabled ? "true" : "false");
    console.log(`CPU Opponent browser control: ${enabled ? "ON" : "OFF"}`);
  };

  const updateCustomCardField = (field, value) => {
    setNewOpponentCard((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="flex min-h-screen bg-zinc-50 font-sans dark:bg-black">
      {/* Show start menu or game controls */}
      {!gameStarted ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            {!isLoaded ? (
              <>
                <p className="text-lg mb-4 dark:text-white">Loading game...</p>
                <div className="w-80 h-6 bg-gray-300 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 transition-all duration-300"
                    style={{ width: `${loadingProgression * 100}%` }}
                  />
                </div>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  {Math.round(loadingProgression * 100)}%
                </p>
              </>
            ) : (
              <>
                <h1 className="text-4xl font-bold mb-8 dark:text-white">
                  Somnia Royale
                </h1>
                <button
                  onClick={() => setGameStarted(true)}
                  className="px-8 py-4 text-xl bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Play Now
                </button>
              </>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Left sidebar */}
          <div className="w-80 bg-white dark:bg-zinc-900 p-4 overflow-y-auto border-r border-zinc-200 dark:border-zinc-800 flex-shrink-0">
            <h2 className="text-xl font-bold mb-4 dark:text-white">
              Game Controls
            </h2>

            {/* Browser Control Toggle */}
            <div className="mb-6">
              <h3 className="font-semibold mb-2 dark:text-white">
                CPU Opponent Mode
              </h3>
              <button
                onClick={() => toggleBrowserControl(true)}
                className="w-full mb-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
              >
                Enable Browser Control
              </button>
              <button
                onClick={() => toggleBrowserControl(false)}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
              >
                Enable AI Control
              </button>
            </div>

            {/* Player Card Queue */}
            <div className="mb-6">
              <h3 className="font-semibold mb-2 dark:text-white">
                Player Cards ({playerCardQueue.length})
              </h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {playerCardQueue.map((card, index) => (
                  <div
                    key={index}
                    className="p-2 bg-red-50 dark:bg-red-900/20 rounded text-sm"
                  >
                    <div className="font-medium dark:text-white">
                      {card.cardName}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Pos: ({card.positionX.toFixed(1)},{" "}
                      {card.positionY.toFixed(1)}, {card.positionZ.toFixed(1)})
                    </div>
                    <button
                      onClick={() => sendPlayerCardBack(index)}
                      className="mt-1 px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                    >
                      Replay Card
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Opponent Card Queue */}
            <div className="mb-6">
              <h3 className="font-semibold mb-2 dark:text-white">
                Opponent Cards ({opponentCardQueue.length})
              </h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {opponentCardQueue.map((card, index) => (
                  <div
                    key={index}
                    className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-sm"
                  >
                    <div className="font-medium dark:text-white">
                      {card.cardName}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Pos: ({card.positionX.toFixed(1)},{" "}
                      {card.positionY.toFixed(1)}, {card.positionZ.toFixed(1)})
                    </div>
                    <button
                      onClick={() => sendOpponentCard(index)}
                      className="mt-1 px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                    >
                      Send to Game
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Opponent Card Creator */}
            <div className="mb-6">
              <h3 className="font-semibold mb-2 dark:text-white">
                Create Custom Opponent Card
              </h3>
              <div className="space-y-2 text-sm">
                <input
                  type="text"
                  placeholder="Prefab Name"
                  value={newOpponentCard.prefabName}
                  onChange={(e) =>
                    updateCustomCardField("prefabName", e.target.value)
                  }
                  className="w-full px-2 py-1 border rounded dark:bg-zinc-800 dark:text-white dark:border-zinc-700"
                />
                <div className="grid grid-cols-3 gap-1">
                  <input
                    type="number"
                    placeholder="X"
                    value={newOpponentCard.positionX}
                    onChange={(e) =>
                      updateCustomCardField(
                        "positionX",
                        parseFloat(e.target.value),
                      )
                    }
                    className="px-2 py-1 border rounded dark:bg-zinc-800 dark:text-white dark:border-zinc-700"
                  />
                  <input
                    type="number"
                    placeholder="Y"
                    value={newOpponentCard.positionY}
                    onChange={(e) =>
                      updateCustomCardField(
                        "positionY",
                        parseFloat(e.target.value),
                      )
                    }
                    className="px-2 py-1 border rounded dark:bg-zinc-800 dark:text-white dark:border-zinc-700"
                  />
                  <input
                    type="number"
                    placeholder="Z"
                    value={newOpponentCard.positionZ}
                    onChange={(e) =>
                      updateCustomCardField(
                        "positionZ",
                        parseFloat(e.target.value),
                      )
                    }
                    className="px-2 py-1 border rounded dark:bg-zinc-800 dark:text-white dark:border-zinc-700"
                  />
                </div>
                <select
                  value={newOpponentCard.placeableType}
                  onChange={(e) =>
                    updateCustomCardField("placeableType", e.target.value)
                  }
                  className="w-full px-2 py-1 border rounded dark:bg-zinc-800 dark:text-white dark:border-zinc-700"
                >
                  <option>Unit</option>
                  <option>Building</option>
                </select>
                <input
                  type="number"
                  placeholder="Hit Points"
                  value={newOpponentCard.hitPoints}
                  onChange={(e) =>
                    updateCustomCardField(
                      "hitPoints",
                      parseFloat(e.target.value),
                    )
                  }
                  className="w-full px-2 py-1 border rounded dark:bg-zinc-800 dark:text-white dark:border-zinc-700"
                />
                <input
                  type="number"
                  placeholder="Damage"
                  value={newOpponentCard.damagePerAttack}
                  onChange={(e) =>
                    updateCustomCardField(
                      "damagePerAttack",
                      parseFloat(e.target.value),
                    )
                  }
                  className="w-full px-2 py-1 border rounded dark:bg-zinc-800 dark:text-white dark:border-zinc-700"
                />
                <button
                  onClick={createCustomOpponentCard}
                  className="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                >
                  Spawn Custom Card
                </button>
              </div>
            </div>

            {/* Custom Cards History */}
            <div>
              <h3 className="font-semibold mb-2 dark:text-white">
                Created Cards ({customOpponentCards.length})
              </h3>
              <div className="space-y-1 max-h-32 overflow-y-auto text-xs">
                {customOpponentCards.map((card, index) => (
                  <div
                    key={index}
                    className="p-1 bg-purple-50 dark:bg-purple-900/20 rounded dark:text-white"
                  >
                    {card.prefabName} - HP:{card.hitPoints} DMG:
                    {card.damagePerAttack}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main game area */}
          <div className="flex-1 flex items-center justify-center">
            <Unity
              unityProvider={unityProvider}
              style={{
                width: 960,
                height: 600,
              }}
            />
          </div>
        </>
      )}

      {/* Hidden Unity component to allow loading before game starts */}
      {!gameStarted && (
        <Unity
          unityProvider={unityProvider}
          style={{
            width: 960,
            height: 600,
            display: "none",
          }}
        />
      )}
    </div>
  );
}
