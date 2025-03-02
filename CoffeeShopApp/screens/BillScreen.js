import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Navbar from '../components/Navbar'

const BillScreen = () => {
  return (
    <View style={styles.container}>
        <Navbar user={{ name: "Selenay", avatarUrl: "https://i.pravatar.cc/150" }} />
        <Text>Bill Screen</Text>

    </View>
  )
}

export default BillScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        paddingTop: 100
    },
})