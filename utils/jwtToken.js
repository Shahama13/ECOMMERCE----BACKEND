// CREATING TOKEN AND SAVING IN COOKIES
const sendToken = (user, statusCode, res) => {

    const token = user.getJWTToken();

    // options for cookie 

    const options = {
        expires: new Date(
            Date.now() + process.env.COOKIE_EXPIRE * 1000 * 60 * 60 * 24,

        ),
        sameSite: process.env.NODE_ENV === "Development" ? "lax" : "none",
        //for our backend will be at different website and frontend at different website
        secure: process.env.NODE_ENV === "Development" ? false : true,
        //if sameSite is set to none  then in that case secure should be set to true otherwise cookies will be blocked
        httpOnly: true,
    }

    res.status(statusCode).cookie("token", token, options).json({
        success: true,
        user,
        token,
    })
}

export default sendToken;