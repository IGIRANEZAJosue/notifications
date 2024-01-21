import { useState, useEffect, useRef } from "react";
import { Text, View, Button, Platform, TouchableOpacity } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import tw from "twrnc";
import { useColorScheme } from "nativewind";
import { StatusBar } from "expo-status-bar";

Notifications.setNotificationHandler({
   handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
   }),
});

export default function App() {
   const [expoPushToken, setExpoPushToken] = useState("");
   const [notification, setNotification] = useState(false);
   const notificationListener = useRef();
   const responseListener = useRef();

   useEffect(() => {
      registerForPushNotificationsAsync().then((token) =>
         setExpoPushToken(token)
      );

      notificationListener.current =
         Notifications.addNotificationReceivedListener((notification) => {
            setNotification(notification);
         });

      responseListener.current =
         Notifications.addNotificationResponseReceivedListener((response) => {
            console.log(response);
         });

      return () => {
         Notifications.removeNotificationSubscription(
            notificationListener.current
         );
         Notifications.removeNotificationSubscription(responseListener.current);
      };
   }, []);

   return (
      <View style={tw` flex-1 items-center gap-16 p-8 bg-gray-900 `}>
         <StatusBar style="light" />
         <Text style={tw`text-3xl text-white font-bold text-center`}>
            Expo Notifications
         </Text>
         <Text style={tw`text-lg text-white text-center`}>
            Your notification info will be displayed below
         </Text>
         <View style={tw`items-center justify-center `}>
            <Text
               style={tw`text-lg text-center text-white font-semibold underline`}
            >
               Notification Title:
            </Text>
            <Text style={tw`text-md text-white text-center mb-6`}>
               {notification && notification.request.content.title}{" "}
            </Text>
            <Text
               style={tw`text-lg text-center text-white font-semibold underline`}
            >
               Notification Body:
            </Text>
            <Text style={tw`text-md text-white text-center mb-6`}>
               {notification && notification.request.content.body}
            </Text>
            <Text
               style={tw`text-lg text-center text-white font-semibold underline`}
            >
               Group Members:
            </Text>
            <Text style={tw`text-md text-white text-center mb-6`}>
               {" "}
               {notification &&
                  JSON.stringify(
                     notification.request.content.data.Member1 +
                        ", " +
                        notification.request.content.data.Member2 +
                        ", " +
                        notification.request.content.data.Member3
                  )}
            </Text>
         </View>

         <TouchableOpacity
            style={tw`bg-[#6c63ff] px-8 py-4 rounded-lg`}
            onPress={async () => {
               await schedulePushNotification();
            }}
         >
            <Text style={`text-lg font-medium text-white`}>Send notification</Text>
         </TouchableOpacity>

         
      </View>
   );
}

async function schedulePushNotification() {
   await Notifications.scheduleNotificationAsync({
      content: {
         title: "You've got a notification",
         body: "Here is the list of the group members ",
         data: {
            Member3: "221026624",
            Member2: "221010009",
            Member1: "221015279",
         },
      },
      trigger: { seconds: 2 },
   });
}

async function registerForPushNotificationsAsync() {
   let token;

   if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
         name: "default",
         importance: Notifications.AndroidImportance.MAX,
         vibrationPattern: [0, 250, 250, 250],
         lightColor: "#FF231F7C",
      });
   }

   if (Device.isDevice) {
      const { status: existingStatus } =
         await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== "granted") {
         const { status } = await Notifications.requestPermissionsAsync();
         finalStatus = status;
      }
      if (finalStatus !== "granted") {
         alert("Failed to get push token for push notification!");
         return;
      }
      token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log(token);
   } else {
      alert("Must use physical device for Push Notifications");
   }

   return token;
}
