import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
} from 'react-native';
import {FirebaseApp} from '../../firebaseConfig';
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import {FirebaseAuth, FirebaseFireStore} from '../../firebaseConfig';

const firestore = getFirestore(FirebaseApp);

const NewPostScreen = () => {
  const [postContent, setPostContent] = useState('');
  const [userName, setUserName] = useState('default');
  const [imageURL, setImageURL] = useState('');

  useEffect(() => {
    const fetchUserName = async () => {
      const user = FirebaseAuth.currentUser;
      if (user) {
        const usersRef = collection(FirebaseFireStore, 'users');
        const q = query(usersRef, where('uid', '==', user.uid));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0].data();
          setUserName(userDoc.name);
        }
      }
    };

    fetchUserName();
  }, []);

  const handlePostSubmit = async () => {
    if (!postContent.trim()) {
      Alert.alert('Error', 'Please enter post content.');
      return;
    }

    try {
      const postData = {
        userId: userName,
        content: postContent,
        timestamp: serverTimestamp(),
        likeCount: 0,
        imageURL: imageURL || '', // Use imageURL if available, otherwise use an empty string
      };

      await addDoc(collection(firestore, 'posts'), postData);

      Alert.alert('Success', 'Post submitted successfully!');
      console.log('Post:', postData);

      setPostContent('');
      setImageURL('');
    } catch (error) {
      console.error('Error creating post:', error);
      Alert.alert('Error', 'Failed to submit post. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Write your post..."
        multiline
        value={postContent}
        onChangeText={setPostContent}
      />
      {imageURL ? (
        <Image source={{uri: imageURL}} style={styles.image} />
      ) : null}
      <TextInput
        style={styles.input}
        placeholder="Enter image URL (optional)"
        value={imageURL}
        onChangeText={setImageURL}
      />
      <TouchableOpacity style={styles.submitButton} onPress={handlePostSubmit}>
        <Text style={styles.submitButtonText}>Post</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  input: {
    height: 50,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 8,
    marginBottom: 16,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: '#128C7E',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
  },
});

export default NewPostScreen;
