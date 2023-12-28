import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Button,
} from 'react-native';
import {FirebaseAuth, FirebaseFireStore} from '../../firebaseConfig';
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
} from 'firebase/firestore';

const UserProfile = () => {
  const imgUrl = 'https://placekitten.com/640/360';
  const [userData, setUserData] = useState({
    uid: '',
    name: '',
    email: '',
    age: '',
    gender: '',
    phone: '',
    photoURL: imgUrl,
  });

  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [editedField, setEditedField] = useState('');
  const [editedValue, setEditedValue] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      const user = FirebaseAuth.currentUser;
      if (user) {
        const usersRef = collection(FirebaseFireStore, 'users');
        const q = query(usersRef, where('uid', '==', user.uid));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0].data();
          setUserData({
            uid: userDoc.uid,
            name: userDoc.name,
            email: userDoc.email,
            age: userDoc.age,
            gender: userDoc.gender,
            phone: userDoc.phone,
            photoURL: userDoc.photoURL,
          });
        }
      }
    };

    fetchUserData();
  }, []);

  const handleEditField = field => {
    setEditedField(field);
    setEditedValue(userData[field]); // Set the initial value to the current field value
    setEditModalVisible(true);
  };

  const handleSaveField = async () => {
    try {
      // Update the field in Firestore
      const userRef = doc(FirebaseFireStore, 'users', userData.uid);
      await updateDoc(userRef, {[editedField]: editedValue});

      // Update the local state
      setUserData(prevData => ({...prevData, [editedField]: editedValue}));

      // Close the modal
      setEditModalVisible(false);
    } catch (error) {
      console.error(`Error updating ${editedField}:`, error);
    }
  };

  return (
    <View style={styles.container}>
      {userData.photoURL && (
        <Image source={{uri: userData.photoURL}} style={styles.avatar} />
      )}
      <Text style={styles.name}>{userData.name || 'No name'}</Text>
      <Text style={styles.email}>{userData.email}</Text>

      <View style={styles.detailContainer}>
        <Text style={styles.detail}>Age: {userData.age || 'N/A'}</Text>
        <TouchableOpacity onPress={() => handleEditField('age')}>
          <Text style={styles.editButton}>Edit</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.detailContainer}>
        <Text style={styles.detail}>Gender: {userData.gender || 'N/A'}</Text>
        <TouchableOpacity onPress={() => handleEditField('gender')}>
          <Text style={styles.editButton}>Edit</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.detailContainer}>
        <Text style={styles.detail}>Phone: {userData.phone || 'N/A'}</Text>
        <TouchableOpacity onPress={() => handleEditField('phone')}>
          <Text style={styles.editButton}>Edit</Text>
        </TouchableOpacity>
      </View>

      {/* Other details... */}

      <Modal visible={isEditModalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text>Edit {editedField}</Text>
          <TextInput
            style={styles.modalInput}
            value={editedValue}
            onChangeText={setEditedValue}
          />
          <Button title="Save" onPress={handleSaveField} />
          <Button title="Cancel" onPress={() => setEditModalVisible(false)} />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  email: {
    fontSize: 16,
    color: 'gray',
    marginBottom: 4,
  },
  detailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detail: {
    fontSize: 16,
    marginRight: 8,
  },
  editButton: {
    color: 'blue',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: 'gray',
    padding: 8,
    marginBottom: 8,
    width: 200,
  },
});

export default UserProfile;
