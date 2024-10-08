import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../../firebase-config";
import { useAuth } from "../../Context/AuthContext";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { FaAngleDown, FaAngleUp } from "react-icons/fa6";
import LocalLoader from "../Loaders/LocalLoader";
import BoxLoader from "../Loaders/BoxLoader";

const IndianMale = ({ setArtistId }) => {
  const { userId } = useAuth();
  const [artists, setArtists] = useState([]);
  const [filteredArtists, setFilteredArtists] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        setIsLoading(true);
        const userDocRef = doc(db, "users", userId);
        const userDoc = await getDoc(userDocRef);
        const userData = userDoc.exists() ? userDoc.data() : {};
        const followedArtistIds = new Set(userData.artists || []);

        const allArtistsSnapshot = await getDocs(collection(db, "artists"));
        const allArtists = allArtistsSnapshot.docs.map((doc) => ({
          ...doc.data(),
          artistId: doc.id,
        }));

        const nonFollowedIndianMaleArtists = allArtists.filter(
          (artist) =>
            !followedArtistIds.has(artist.artistId) &&
            artist.artistType === "indian" &&
            artist.gender === "male"
        );

        setArtists(allArtists);
        setFilteredArtists(nonFollowedIndianMaleArtists);
      } catch (error) {
        console.error("Error fetching artists: ", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchArtists();
    }
  }, [userId]);

  const handleShowMore = () => {
    setShowAll(!showAll);
  };

  const handleArtistClick = (artistId) => {
    navigate(`/app/followingdetails?a=${artistId}`)
  };

  if (isLoading) {
    return <BoxLoader />;
  }

  if (filteredArtists.length === 0) {
    return null;
  }

  const initialDisplayCount = 5;

  return (
    <div className="md:p-5 max-md:my-5 flex flex-col">
      <h1 className="text-3xl max-md:text-xl font-semibold text-textcolor mb-5">
        Popular Indian Male Artists
      </h1>
      <div className="flex flex-wrap gap-4">
        {(showAll
          ? filteredArtists
          : filteredArtists.slice(0, initialDisplayCount)
        ).map((artist) => (
          <div
            key={artist.artistId}
            className="flex flex-col items-center cursor-pointer"
            onClick={() => handleArtistClick(artist.artistId)}
          >
            <img
              src={artist.photoURL || "default-image-url"}
              alt={artist.name}
              className="h-24 w-24 rounded-full object-cover mb-2 border-4 border-white"
            />
            <p className="text-center text-textcolor text-sm font-semibold">
              {artist.name}
            </p>
          </div>
        ))}
      </div>
      {filteredArtists.length > initialDisplayCount && (
        <div className="w-full flex items-center justify-center">
          <button
            onClick={handleShowMore}
            className="mt-5 px-4 py-2 gap-2 flex items-center justify-center text-textcolor font-semibold rounded-full border-2 border-primarycolor"
          >
            {showAll ? (
              <div className="flex items-center justify-center">
                Show Less <FaAngleUp className="ml-2" />
              </div>
            ) : (
              <div className="flex items-center justify-center">
                Show More <FaAngleDown className="ml-2" />
              </div>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default IndianMale;
