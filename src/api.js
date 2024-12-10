import axios from "axios";

const URL = "http://localhost:5001"
//posts blog functions
export async function getCourses() {
const response = await axios.get(`${URL}/course`)
if(response.status === 200) {
    return response.data
}else{
    return
}
}
export async function getCourse(id) {
    const response = await axios.get(`${URL}/course/${id}`)
if(response.status === 200) {
    return response.data
}else{
    return
}
}
export async function createCourse(formData) {
    const response = await axios.post(`${URL}/course`, formData)
    return response
}
// export async function updateCourse(id, course) {
//     const response = await axios.put(`${URL}/course/${id}`, course)
//     return response 
// }

export async function updateCourse(id, course) {
    try {
        const response = await axios.put(`${URL}/course/${id}`, course); // Ensure id is passed
        return response;
    } catch (error) {
        console.error("Error updating course:", error);
        throw error;
    }
}

export async function deleteCourse(id) {
    const response = await axios.delete(`${URL}/course/${id}`)
return response
}


// users routes functions
export async function getUser(id) {
    const response = await axios.get(`${URL}/user/${id}`)
if(response.status === 200) {
    return response.data
}else{
    return
}
}
export async function createUser(user) {
    const response = await axios.post(`${URL}/user`, user)
    return response
}
export async function updateUser(id, user) {
    const response = await axios.put(`${URL}/user/${id}`, user)
    return response 
}

export async function verifyUser(user){
    const response = await axios.post(`${URL}/user/login`, user)
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
    const response = await axios.post(`${URL}/images`, formData, {
        'Content-Type': 'multipart/form-data'
    })
    return response
} 

export async function getImage(id){
    const response = await axios.post(`${URL}/images/${id}`)
    return response
} 