/* eslint-disable prettier/prettier */
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {FirebaseAuth, FirebaseFireStore} from '../../firebaseConfig';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from 'firebase/firestore';

const UserProfile = () => {
  const imgUrl = 'https://placekitten.com/640/360';
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    age: '',
    gender: '',
    phone: '',
    photoURL: imgUrl,
  });

  const [editableFields, setEditableFields] = useState({
    name: false,
    age: false,
    gender: false,
    phone: false,
  });

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

  const handleEdit = field => {
    setEditableFields({...editableFields, [field]: true});
  };

  const handleSave = async field => {
    try {
      const userRef = doc(
        FirebaseFireStore,
        'users',
        FirebaseAuth.currentUser.uid,
      );

      await updateDoc(userRef, {[field]: userData[field]});

      setEditableFields({...editableFields, [field]: false});
      Alert.alert('Success', `Your ${field} has been updated successfully!`);
    } catch (error) {
      console.error(`Error updating ${field}:`, error);
      Alert.alert('Error', `Failed to update ${field}. Please try again.`);
    }
  };

  const renderEditableField = (field, label) => (
    <View style={styles.editableFieldContainer}>
      <Text style={styles.label}>{label}</Text>
      {editableFields[field] ? (
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={userData[field]}
            onChangeText={text => setUserData({...userData, [field]: text})}
          />
          <TouchableOpacity onPress={() => handleSave(field)}>
            <Text style={styles.saveButton}>Save</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>{userData[field]}</Text>
          <TouchableOpacity onPress={() => handleEdit(field)}>
            <Text style={styles.editButton}>Edit</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {userData.photoURL && (
        <Image source={{uri: userData.photoURL}} style={styles.avatar} />
      )}
      {renderEditableField('name', 'Name')}
      <Text style={styles.email}>{userData.email}</Text>
      {renderEditableField('age', 'Age')}
      {renderEditableField('gender', 'Gender')}
      {renderEditableField('phone', 'Phone')}
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
  email: {
    fontSize: 16,
    color: 'gray',
    marginBottom: 10,
  },
  editableFieldContainer: {
    marginBottom: 15,
    width: '80%',
  },
  fieldContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: 'bold',
  },
  fieldLabel: {
    fontSize: 16,
    marginRight: 10,
  },
  editButton: {
    color: 'blue',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    marginRight: 10,
    paddingLeft: 5,
  },
  saveButton: {
    color: 'green',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default UserProfile;
