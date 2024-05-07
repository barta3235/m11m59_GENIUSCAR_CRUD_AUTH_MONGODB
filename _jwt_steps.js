/**
 *  1.  post user email as body to /jwt api
 *      axios.post('/jwt',user)
 *  
 * 
 *  2. In server receive the token by user=req.body;
 *     create token=jwt.sign(user, process.env>ACCESS_TOKEN_SECRET,{expires in : '1h'})
 *     set token to cookie 
 *               res.send('token',token,{
 *                   httpOnly true
 *                   secure false
 *                           
 *               })
 */


/**
 *  1. Set cookies with http only
 * 
 *  2. CORS
 *      include the local host site as origin and set credential to true
 * 
 * 
 *  3. client side axios setting credentials:true
 *  in axios set withCredential:true
 */


/**
 *   1. to send cookies form the client make sure you added with Credentials for the api call and in server side we use the parser as middleware to read the cookie
 */