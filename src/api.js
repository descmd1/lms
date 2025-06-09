import axios from "axios";

const base_url = process.env.REACT_APP_BASE_URL;

//posts blog functions
export async function getCourses() {
const response = await axios.get(`${base_url}/course`)
if(response.status === 200) {
    return response.data
}else{
    return
}
}
export async function getCourse(id) {
    const response = await axios.get(`${base_url}/course/${id}`)
if(response.status === 200) {
    return response.data
}else{
    return
}
}
export async function createCourse(formData) {
    const response = await axios.post(`${base_url}/course`, formData)
    return response
}

export async function updateCourse(id, course) {
    try {
        const response = await axios.put(`${base_url}/course/${id}`, course); 
        return response;
    } catch (error) {
        console.error("Error updating course:", error);
        throw error;
    }
}

export async function deleteCourse(id) {
    const response = await axios.delete(`${base_url}/course/${id}`)
return response
}


// users routes functions
export async function getUser(id) {
    const response = await axios.get(`${base_url}/user/${id}`)
if(response.status === 200) {
    return response.data
}else{
    return
}
}
export async function createUser(user) {
    const response = await axios.post(`${base_url}/user`, user)
    return response
}
export async function updateUser(id, user) {
    const response = await axios.put(`${base_url}/user/${id}`, user)
    return response 
}

export async function verifyUser(user){
    const response = await axios.post(`${base_url}/user/login`, user)
    if(response.data.success){
        return response.data.token
    }else{
        return
    }
}

//FOR UPLOADING IMAGES TO AWS
export async function createImage(file){
    const formData = new FormData()
    formData.append('image', file)
    const response = await axios.post(`${base_url}/images`, formData, {
        'Content-Type': 'multipart/form-data'
    })
    return response
} 

export async function getImage(id){
    const response = await axios.post(`${base_url}/images/${id}`)
    return response
} 

console.log("Base URL:", base_url);