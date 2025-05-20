// File: C:\Users\PMYLS\Desktop\Mahendar Website\Admin-Dashboard-for-Kidz-Zone (2)\kidz-zone-admin\src\lib\storyService.ts
import { db, storage } from "./firebase";
import { 
  collection, addDoc, updateDoc, deleteDoc, getDocs, 
  doc, query, where, orderBy, Timestamp 
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

export type Story = {
  id?: string;
  title: string;
  description: string;
  imageUrl: string;
  ageGroup: string;
  content: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export const addStory = async (story: Omit<Story, 'id' | 'createdAt' | 'updatedAt'>, imageFile: File) => {
  try {
    // Upload image
    const storageRef = ref(storage, `stories/${Date.now()}_${imageFile.name}`);
    await uploadBytes(storageRef, imageFile);
    const imageUrl = await getDownloadURL(storageRef);
    
    // Add story with image URL
    const docRef = await addDoc(collection(db, "stories"), {
      ...story,
      imageUrl,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    
    return { id: docRef.id };
  } catch (error) {
    console.error("Error adding story: ", error);
    throw error;
  }
};

export const updateStory = async (id: string, story: Partial<Story>, imageFile?: File) => {
  try {
    const storyRef = doc(db, "stories", id);
    let updatedStory = { ...story, updatedAt: Timestamp.now() };
    
    // If new image is provided, upload it and update URL
    if (imageFile) {
      const storageRef = ref(storage, `stories/${Date.now()}_${imageFile.name}`);
      await uploadBytes(storageRef, imageFile);
      updatedStory.imageUrl = await getDownloadURL(storageRef);
    }
    
    await updateDoc(storyRef, updatedStory);
    return { id };
  } catch (error) {
    console.error("Error updating story: ", error);
    throw error;
  }
};

export const deleteStory = async (id: string, imageUrl: string) => {
  try {
    // Delete image from storage if it's a Firebase URL
    if (imageUrl && imageUrl.includes("firebasestorage")) {
      try {
        const imageRef = ref(storage, imageUrl);
        await deleteObject(imageRef);
      } catch (err) {
        console.error("Error deleting image", err);
        // Continue with document deletion even if image deletion fails
      }
    }
    
    // Delete story document
    await deleteDoc(doc(db, "stories", id));
    return { success: true };
  } catch (error) {
    console.error("Error deleting story: ", error);
    throw error;
  }
};

export const getStories = async (ageGroup?: string) => {
  try {
    let q;
    if (ageGroup) {
      q = query(
        collection(db, "stories"), 
        where("ageGroup", "==", ageGroup),
        orderBy("createdAt", "desc")
      );
    } else {
      q = query(
        collection(db, "stories"),
        orderBy("createdAt", "desc")
      );
    }
    
    const querySnapshot = await getDocs(q);
    const stories: Story[] = [];
    
    querySnapshot.forEach((doc) => {
      stories.push({ id: doc.id, ...(doc.data() as object) } as Story);
    });
    
    return stories;
  } catch (error) {
    console.error("Error getting stories: ", error);
    throw error;
  }
};