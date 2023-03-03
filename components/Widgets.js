import { SearchIcon } from "@heroicons/react/outline";
import { db } from "../firebase";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { useRouter } from "next/router";
import { useRecoilState } from "recoil";
import { userState } from "../atom/userAtom";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

export default function Widgets({ randomUsersResults }) {
  const router = useRouter();
  const [randomUserNum, setRandomUserNum] = useState(3);
  const [currentUser, setCurrentUser] = useRecoilState(userState);

  const onGoogleClick = async () => {
    try {
      const auth = getAuth();
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      const user = auth.currentUser.providerData[0];
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        await setDoc(docRef, {
          name: user.displayName,
          email: user.email,
          username: user.displayName.split(" ").join("").toLocaleLowerCase(),
          userImg: user.photoURL,
          uid: user.uid,
          timestamp: serverTimestamp(),
        });
      }
      router.push("/");
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className="xl:w-[600px] hidden lg:inline ml-8 space-y-5">
      <div className="w-[90%] xl:w-[75%] sticky top-0 bg-white py-1.5 z-50">
        <div className="flex items-center p-3 rounded-full  relative">
          <SearchIcon className="h-5 z-50 text-gray-500" />
          <input
            className="absolute inset-0 rounded-full pl-11 border-gray-500 text-gray-700 focus:shadow-lg focus:bg-white bg-gray-100 "
            type="text"
            placeholder="Search Twitter"
          />
        </div>
      </div>

      {!currentUser ? (
        <>
          <div className="text-gray-700 space-y-3 bg-gray-100 rounded-xl pt-2 pb-4 w-[90%] xl:w-[75%] flex flex-col items-center">
            <h4 className="font-bold text-xl px-4 text-center">
              New to Twitter?
            </h4>
            <button
              type="button"
              className="text-white bg-[#4285F4] hover:bg-[#4285F4]/90 focus:ring-4 focus:outline-none 
          focus:ring-[#4285F4]/50 font-medium rounded-lg text-sm px-6 py-2.5 text-center inline-flex 
          items-center dark:focus:ring-[#4285F4]/55 mr-2 mb-2 ml-2 
          "
              onClick={onGoogleClick}
            >
              <svg
                className="w-4 h-4 mr-2 -ml-1"
                aria-hidden="true"
                focusable="false"
                data-prefix="fab"
                data-icon="google"
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 488 512"
              >
                <path
                  fill="currentColor"
                  d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
                ></path>
              </svg>
              Sign in with Google
            </button>
          </div>
        </>
      ) : (
        <p></p>
      )}
      <div className="sticky top-16 text-gray-700 space-y-3 bg-gray-100 pt-2 rounded-xl w-[90%] xl:w-[75%]">
        <h4 className="font-bold text-xl px-4">Who to follow</h4>
        <AnimatePresence>
          {randomUsersResults?.slice(0, randomUserNum).map((randomUser) => (
            <motion.div
              key={randomUser.login.username}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
            >
              <div
                key={randomUser.login.username}
                className="flex items-center px-4 py-2  cursor-pointer hover:bg-gray-200 transition duration-500 ease-out"
              >
                <img
                  className="rounded-full"
                  width="40"
                  src={randomUser.picture.thumbnail}
                  alt=""
                />
                <div className="truncate ml-4 leading-5">
                  <h4 className="font-bold hover:underline text-[14px] truncate">
                    {randomUser.login.username}
                  </h4>
                  <h5 className="text-[13px] text-gray-500 truncate">
                    {randomUser.name.first + " " + randomUser.name.last}
                  </h5>
                </div>
                <button className="ml-auto bg-black text-white rounded-full text-sm px-3.5 py-1.5 font-bold">
                  Follow
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <button
          onClick={() => setRandomUserNum(randomUserNum + 3)}
          className="text-blue-300 pl-4 pb-3 hover:text-blue-400"
        >
          Show more
        </button>
      </div>
    </div>
  );
}
