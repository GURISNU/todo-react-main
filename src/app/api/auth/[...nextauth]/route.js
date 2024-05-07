import NextAuth from "next-auth";
import KakaoProvider from "next-auth/providers/kakao";

console.log("NEXTAUTH_SECRET:", process.env.NEXTAUTH_SECRET);

const handler = NextAuth({
    providers: [
        KakaoProvider({
            clientId: process.env.KAKAO_CLIENT_ID || "",
            clientSecret: process.env.KAKAO_CLIENT_SECRET || "",
        }),
    ],
});

export { handler as GET, handler as POST };