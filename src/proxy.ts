import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/", // Jika ada yang mencoba masuk diam-diam, tendang kembali ke halaman Login ("/")
  },
});

export const config = {
  // Tanda /:path* memastikan bahwa halaman beserta seluruh sub-halamannya (jika ada) ikut terkunci
  matcher: [
    "/calculator/:path*", 
    "/dashboard/:path*", 
    "/master-data/:path*"
  ], 
};