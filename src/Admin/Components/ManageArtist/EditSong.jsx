// import React, { useState, useEffect } from "react";
// import {
//   collection,
//   query,
//   where,
//   getDocs,
//   getDoc,
//   doc,
//   updateDoc,
// } from "firebase/firestore";
// import { db } from "../../../../firebase-config";
// import { toast } from "react-toastify";

// const EditSong = () => {
//   const [artistSearchTerm, setArtistSearchTerm] = useState("");
//   const [artistSuggestions, setArtistSuggestions] = useState([]);
//   const [selectedArtistId, setSelectedArtistId] = useState("");
//   const [artistName, setArtistName] = useState("");
//   const [songSearchTerm, setSongSearchTerm] = useState("");
//   const [songSuggestions, setSongSuggestions] = useState([]);
//   const [selectedSong, setSelectedSong] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);

//   useEffect(() => {
//     if (selectedArtistId) {
//       fetchArtistName();
//     }
//   }, [selectedArtistId]);

//   useEffect(() => {
//     if (selectedArtistId) {
//       fetchSongsByArtist();
//     }
//   }, [selectedArtistId, songSearchTerm]);

//   const fetchSuggestions = async (term, type) => {
//     try {
//       if (term.length === 0) {
//         if (type === "artist") setArtistSuggestions([]);
//         if (type === "song") setSongSuggestions([]);
//         return;
//       }

//       const collectionName = type === "artist" ? "artists" : "songs";
//       const q = query(
//         collection(db, collectionName),
//         where("name", ">=", ""),
//         where("name", "<=", "\uf8ff")
//       );

//       const querySnapshot = await getDocs(q);
//       const results = [];
//       querySnapshot.forEach((doc) => {
//         results.push({ id: doc.id, ...doc.data() });
//       });

//       const filteredResults = results.filter((item) => {
//         return item.name.toLowerCase().includes(term.toLowerCase());
//       });

//       filteredResults.sort((a, b) => {
//         const aName = a.name.toLowerCase();
//         const bName = b.name.toLowerCase();

//         const aMatch = aName.indexOf(term.toLowerCase());
//         const bMatch = bName.indexOf(term.toLowerCase());

//         if (aMatch !== -1 && bMatch !== -1) {
//           return aMatch - bMatch;
//         }

//         if (aMatch !== -1) return -1;
//         if (bMatch !== -1) return 1;

//         return aName.localeCompare(bName);
//       });

//       if (type === "artist") setArtistSuggestions(filteredResults);
//       if (type === "song") setSongSuggestions(filteredResults);
//     } catch (error) {
//       console.error("Error fetching suggestions:", error);
//       toast.error("Error fetching suggestions.");
//     }
//   };

//   const fetchArtistName = async () => {
//     try {
//       const docRef = doc(db, "artists", selectedArtistId);
//       const docSnap = await getDoc(docRef);

//       if (docSnap.exists()) {
//         setArtistName(docSnap.data().name);
//       } else {
//         toast.error("Artist not found.");
//       }
//     } catch (error) {
//       console.error("Error fetching artist name:", error);
//       toast.error("Error fetching artist name.");
//     }
//   };

//   const fetchSongsByArtist = async () => {
//     try {
//       if (!selectedArtistId) return;

//       const docRef = doc(db, "artists", selectedArtistId);
//       const docSnap = await getDoc(docRef);
//       const artistData = docSnap.data();
//       const songs = artistData.songs || [];

//       let filteredSongs;
//       if (songSearchTerm.length > 0) {
//         filteredSongs = songs.filter((song) =>
//           song.songName.toLowerCase().includes(songSearchTerm.toLowerCase())
//         );
//       } else {
//         filteredSongs = songs;
//       }

//       filteredSongs.sort((a, b) => {
//         const aName = a.songName.toLowerCase();
//         const bName = b.songName.toLowerCase();

//         const aMatch = aName.indexOf(songSearchTerm.toLowerCase());
//         const bMatch = bName.indexOf(songSearchTerm.toLowerCase());

//         if (aMatch !== -1 && bMatch !== -1) {
//           return aMatch - bMatch;
//         }

//         if (aMatch !== -1) return -1;
//         if (bMatch !== -1) return 1;

//         return aName.localeCompare(bName);
//       });

//       setSongSuggestions(filteredSongs);
//     } catch (error) {
//       console.error("Error fetching songs by artist:", error);
//       toast.error("Error fetching songs by artist.");
//     }
//   };

//   const handleSearchTermChange = (event, type) => {
//     const term = event.target.value;
//     if (type === "artist") {
//       setArtistSearchTerm(term);
//       fetchSuggestions(term, "artist");
//       setSelectedSong(null);
//       setSelectedArtistId("");
//       setSongSearchTerm("");
//     } else if (type === "song") {
//       setSelectedSong(null);
//       setSongSearchTerm(term);
//     }
//   };

//   const handleSuggestionClick = (item, type) => {
//     if (type === "artist") {
//       setSelectedArtistId(item.id);
//       setArtistSuggestions([]);
//       setArtistSearchTerm(item.name);
//     } else if (type === "song") {
//       const song = songSuggestions.find((song) => song.id === item.id);
//       setSelectedSong(song);
//       setSongSuggestions([]);
//       setSongSearchTerm(item.songName);
//     }
//   };

//   const handleInputChange = (field, value) => {
//     setSelectedSong((prevSong) => ({ ...prevSong, [field]: value }));
//   };

//   const handleSubmit = async (event) => {
//     event.preventDefault();
//     setIsLoading(true);

//     try {
//       const docRef = doc(db, "artists", selectedArtistId);
//       const artistDoc = await getDoc(docRef);
//       const existingSongs = artistDoc.data().songs || [];

//       const updatedSongs = existingSongs.map((song) =>
//         song.songId === selectedSong.songId ? selectedSong : song
//       );

//       await updateDoc(docRef, {
//         songs: updatedSongs,
//       });

//       toast.success("Song updated successfully!");
//       setArtistSearchTerm("");
//       setSelectedArtistId("");
//       setArtistName("");
//       setSongSearchTerm("");
//       setSelectedSong(null);
//     } catch (error) {
//       console.error("Error updating song:", error);
//       toast.error("Error updating song.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <form
//       className="flex flex-col w-[400px] max-md:w-[90%]"
//       onSubmit={handleSubmit}
//     >
//       <h2 className="text-xl text-textcolor font-semibold mt-5 mb-2">
//         Select Artist:
//       </h2>
//       <input
//         type="text"
//         value={artistSearchTerm}
//         onChange={(e) => handleSearchTermChange(e, "artist")}
//         placeholder="Enter artist name"
//         className="w-full p-2 bg-slate-600 text-lg text-white font-semibold rounded-md outline-none"
//         required
//       />
//       {artistSuggestions.length > 0 && (
//         <ul className="mt-2 max-h-60 overflow-y-auto">
//           {artistSuggestions.map((artist) => (
//             <li
//               key={artist.id}
//               onClick={() => handleSuggestionClick(artist, "artist")}
//               className="p-2 font-bold bg-slate-300 mt-1 cursor-pointer rounded-md hover:bg-slate-400"
//             >
//               {artist.name}
//             </li>
//           ))}
//         </ul>
//       )}

//       {selectedArtistId && (
//         <>
//           <h2 className="text-xl text-textcolor font-semibold mt-5 mb-2">
//             Select Song:
//           </h2>
//           <input
//             type="text"
//             value={songSearchTerm}
//             onChange={(e) => handleSearchTermChange(e, "song")}
//             placeholder="Enter song name"
//             className="w-full p-2 bg-slate-600 text-lg text-white font-semibold rounded-md outline-none"
//             required
//           />
//           {songSuggestions.length > 0 && selectedSong === null && (
//             <ul className=" mt-4 max-h-32 pt-2 overflow-y-auto scrollbar-custom bg-slate-600 rounded-md">
//               {songSuggestions.map((song) => (
//                 <li
//                   key={song.songId}
//                   onClick={() => handleSuggestionClick(song, "song")}
//                   className="p-2 mx-2 font-bold bg-slate-300 mb-2 cursor-pointer rounded-md hover:bg-slate-400"
//                 >
//                   {song.songName}
//                 </li>
//               ))}
//             </ul>
//           )}
//         </>
//       )}

//       {selectedSong && (
//         <>
//           <div className="mb-4 flex flex-col items-center justify-center gap-3">
//             <h2 className="mt-16 text-xl text-textcolor font-semibold w-full">
//               Song Name :
//             </h2>
//             <input
//               type="text"
//               value={selectedSong.songName}
//               onChange={(e) => handleInputChange("songName", e.target.value)}
//               placeholder="Song Name"
//               className="w-full p-2 bg-slate-600 text-lg text-white font-semibold rounded-md outline-none"
//               required
//             />
//             <h2 className="text-xl text-textcolor font-semibold w-full">
//               Cover Image :
//             </h2>
//             <input
//               type="text"
//               value={selectedSong.coverImgUrl}
//               onChange={(e) => handleInputChange("coverImgUrl", e.target.value)}
//               placeholder="Song Cover Image URL"
//               className="w-full p-2 bg-slate-600 text-lg text-white font-semibold rounded-md outline-none"
//               required
//             />
//             <h2 className="text-xl text-textcolor font-semibold w-full">
//               Song :
//             </h2>
//             <input
//               type="text"
//               value={selectedSong.songUrl}
//               onChange={(e) => handleInputChange("songUrl", e.target.value)}
//               placeholder="Song URL"
//               className="w-full p-2 bg-slate-600 text-lg text-white font-semibold rounded-md outline-none"
//               required
//             />
//           </div>
//           <button
//             type="submit"
//             className="max-md:w-full bg-textcolor text-lg font-bold text-slate-900 p-2 rounded-md outline-none"
//             disabled={isLoading}
//           >
//             {isLoading ? "Updating..." : "Update Song"}
//           </button>
//         </>
//       )}
//     </form>
//   );
// };

// export default EditSong;



import React, { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../../../firebase-config";
import { toast } from "react-toastify";

const EditSong = () => {
  const [artistSearchTerm, setArtistSearchTerm] = useState("");
  const [artistSuggestions, setArtistSuggestions] = useState([]);
  const [selectedArtistId, setSelectedArtistId] = useState("");
  const [artistName, setArtistName] = useState("");
  const [songSearchTerm, setSongSearchTerm] = useState("");
  const [songSuggestions, setSongSuggestions] = useState([]);
  const [selectedSong, setSelectedSong] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (selectedArtistId) {
      fetchArtistName();
    }
  }, [selectedArtistId]);

  useEffect(() => {
    if (selectedArtistId) {
      fetchSongsByArtist();
    }
  }, [selectedArtistId, songSearchTerm]);

  const fetchSuggestions = async (term, type) => {
    try {
      if (term.length === 0) {
        if (type === "artist") setArtistSuggestions([]);
        if (type === "song") setSongSuggestions([]);
        return;
      }

      const collectionName = type === "artist" ? "artists" : "songs";
      const q = query(
        collection(db, collectionName),
        where("name", ">=", ""),
        where("name", "<=", "\uf8ff")
      );

      const querySnapshot = await getDocs(q);
      const results = [];
      querySnapshot.forEach((doc) => {
        results.push({ id: doc.id, ...doc.data() });
      });

      const filteredResults = results.filter((item) => {
        return item.name.toLowerCase().includes(term.toLowerCase());
      });

      filteredResults.sort((a, b) => {
        const aName = a.name.toLowerCase();
        const bName = b.name.toLowerCase();

        const aMatch = aName.indexOf(term.toLowerCase());
        const bMatch = bName.indexOf(term.toLowerCase());

        if (aMatch !== -1 && bMatch !== -1) {
          return aMatch - bMatch;
        }

        if (aMatch !== -1) return -1;
        if (bMatch !== -1) return 1;

        return aName.localeCompare(bName);
      });

      if (type === "artist") setArtistSuggestions(filteredResults);
      if (type === "song") setSongSuggestions(filteredResults);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      toast.error("Error fetching suggestions.");
    }
  };

  const fetchArtistName = async () => {
    try {
      const docRef = doc(db, "artists", selectedArtistId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setArtistName(docSnap.data().name);
      } else {
        toast.error("Artist not found.");
      }
    } catch (error) {
      console.error("Error fetching artist name:", error);
      toast.error("Error fetching artist name.");
    }
  };

  const fetchSongsByArtist = async () => {
    try {
      if (!selectedArtistId) return;

      const docRef = doc(db, "artists", selectedArtistId);
      const docSnap = await getDoc(docRef);
      const artistData = docSnap.data();
      const songs = artistData.songs || [];

      let filteredSongs;
      if (songSearchTerm.length > 0) {
        filteredSongs = songs.filter((song) =>
          song.songName.toLowerCase().includes(songSearchTerm.toLowerCase())
        );
      } else {
        filteredSongs = songs;
      }

      filteredSongs.sort((a, b) => {
        const aName = a.songName.toLowerCase();
        const bName = b.songName.toLowerCase();

        const aMatch = aName.indexOf(songSearchTerm.toLowerCase());
        const bMatch = bName.indexOf(songSearchTerm.toLowerCase());

        if (aMatch !== -1 && bMatch !== -1) {
          return aMatch - bMatch;
        }

        if (aMatch !== -1) return -1;
        if (bMatch !== -1) return 1;

        return aName.localeCompare(bName);
      });

      setSongSuggestions(filteredSongs);
    } catch (error) {
      console.error("Error fetching songs by artist:", error);
      toast.error("Error fetching songs by artist.");
    }
  };

  const handleSearchTermChange = (event, type) => {
    const term = event.target.value;
    if (type === "artist") {
      setArtistSearchTerm(term);
      fetchSuggestions(term, "artist");
      setSelectedSong(null);
      setSelectedArtistId("");
      setSongSearchTerm("");
    } else if (type === "song") {
      setSelectedSong(null);
      setSongSearchTerm(term);
    }
  };

  const handleSuggestionClick = (item, type) => {
    if (type === "artist") {
      setSelectedArtistId(item.id);
      setArtistSuggestions([]);
      setArtistSearchTerm(item.name);
    } else if (type === "song") {
      // Directly set the selected song without refetching
      console.log("Clicked song:", item);
      setSelectedSong(item);
      setSongSuggestions([]);
      setSongSearchTerm(item.songName);
    }
  };
  

  const handleInputChange = (field, value) => {
    setSelectedSong((prevSong) => ({ ...prevSong, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
  
    try {
      const docRef = doc(db, "artists", selectedArtistId);
      const artistDoc = await getDoc(docRef);
      const existingSongs = artistDoc.data().songs || [];
  
      const updatedSongs = existingSongs.map((song) =>
        song.songId === selectedSong.songId
          ? { ...selectedSong, updatedOn: new Date().toISOString() }
          : song
      );
  
      await updateDoc(docRef, {
        songs: updatedSongs,
      });
  
      toast.success("Song updated successfully!");
      setArtistSearchTerm("");
      setSelectedArtistId("");
      setArtistName("");
      setSongSearchTerm("");
      setSelectedSong(null);
    } catch (error) {
      console.error("Error updating song:", error);
      toast.error("Error updating song.");
    } finally {
      setIsLoading(false);
    }
  };
  

  return (
    <form
      className="flex flex-col w-[400px] max-md:w-[90%]"
      onSubmit={handleSubmit}
    >
      <h2 className="text-xl text-textcolor font-semibold mt-5 mb-2">
        Select Artist:
      </h2>
      <input
        type="text"
        value={artistSearchTerm}
        onChange={(e) => handleSearchTermChange(e, "artist")}
        placeholder="Enter artist name"
        className="w-full p-2 bg-slate-600 text-lg text-white font-semibold rounded-md outline-none"
        required
      />
      {artistSuggestions.length > 0 && (
        <ul className="mt-2 max-h-60 overflow-y-auto">
          {artistSuggestions.map((artist) => (
            <li
              key={artist.id}
              onClick={() => handleSuggestionClick(artist, "artist")}
              className="p-2 font-bold bg-slate-300 mt-1 cursor-pointer rounded-md hover:bg-slate-400"
            >
              {artist.name}
            </li>
          ))}
        </ul>
      )}

      {selectedArtistId && (
        <>
          <h2 className="text-xl text-textcolor font-semibold mt-5 mb-2">
            Select Song:
          </h2>
          <input
            type="text"
            value={songSearchTerm}
            onChange={(e) => handleSearchTermChange(e, "song")}
            placeholder="Enter song name"
            className="w-full p-2 bg-slate-600 text-lg text-white font-semibold rounded-md outline-none"
            required
          />
          {songSuggestions.length > 0 && selectedSong === null && (
            <ul className="mt-4 max-h-32 pt-2 overflow-y-auto scrollbar-custom bg-slate-600 rounded-md">
              {songSuggestions.map((song) => (
                <li
                  key={song.songId}
                  onClick={() => handleSuggestionClick(song, "song")}
                  className="p-2 mx-2 font-bold bg-slate-300 mb-2 cursor-pointer rounded-md hover:bg-slate-400"
                >
                  {song.songName}
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {selectedSong && (
        <>
          <div className="mb-4 flex flex-col items-center justify-center gap-3">
            <h2 className="mt-16 text-xl text-textcolor font-semibold w-full">
              Song Name:
            </h2>
            <input
              type="text"
              value={selectedSong.songName}
              onChange={(e) => handleInputChange("songName", e.target.value)}
              placeholder="Song Name"
              className="w-full p-2 bg-slate-600 text-lg text-white font-semibold rounded-md outline-none"
              required
            />
            <h2 className="text-xl text-textcolor font-semibold w-full">
              Cover Image:
            </h2>
            <input
              type="text"
              value={selectedSong.coverImgUrl}
              onChange={(e) => handleInputChange("coverImgUrl", e.target.value)}
              placeholder="Song Cover Image URL"
              className="w-full p-2 bg-slate-600 text-lg text-white font-semibold rounded-md outline-none"
              required
            />
            <h2 className="text-xl text-textcolor font-semibold w-full">
              Song URL:
            </h2>
            <input
              type="text"
              value={selectedSong.songUrl}
              onChange={(e) => handleInputChange("songUrl", e.target.value)}
              placeholder="Song URL"
              className="w-full p-2 bg-slate-600 text-lg text-white font-semibold rounded-md outline-none"
              required
            />
          </div>
          <button
            type="submit"
            className="max-md:w-full bg-textcolor text-lg font-bold text-slate-900 p-2 rounded-md outline-none"
            disabled={isLoading}
          >
            {isLoading ? "Updating..." : "Update Song"}
          </button>
        </>
      )}
    </form>
  );
};

export default EditSong;
