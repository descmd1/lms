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
    const response = await axios.post(`${base_url}/course`, formData, {
        timeout: 420000, // 7 minutes timeout
        headers: {
            'Content-Type': 'multipart/form-data'
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            console.log(`Upload Progress: ${percentCompleted}%`);
        }
    })
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

// Live Session API functions
export async function createLiveSession(sessionData) {
    const token = sessionStorage.getItem('user');
    const response = await axios.post(`${base_url}/live-session`, sessionData, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    return response;
}

export async function getLiveSessionsForCourse(courseId) {
    const token = sessionStorage.getItem('user');
    const response = await axios.get(`${base_url}/live-session/course/${courseId}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    if (response.status === 200) {
        return response.data;
    } else {
        return [];
    }
}

export async function getTutorLiveSessions() {
    const token = sessionStorage.getItem('user');
    const response = await axios.get(`${base_url}/live-session/tutor`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    if (response.status === 200) {
        return response.data;
    } else {
        return [];
    }
}

export async function startLiveSession(sessionId) {
    const token = sessionStorage.getItem('user');
    const response = await axios.put(`${base_url}/live-session/${sessionId}/start`, {}, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return response;
}

export async function endLiveSession(sessionId, recordingUrl = null) {
    const token = sessionStorage.getItem('user');
    const response = await axios.put(`${base_url}/live-session/${sessionId}/end`, {
        recordingUrl
    }, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return response;
}

export async function joinLiveSession(sessionId) {
    const token = sessionStorage.getItem('user');
    const response = await axios.post(`${base_url}/live-session/${sessionId}/join`, {}, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return response;
}

export async function leaveLiveSession(sessionId) {
    const token = sessionStorage.getItem('user');
    const response = await axios.post(`${base_url}/live-session/${sessionId}/leave`, {}, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return response;
}

export async function updateLiveSession(sessionId, sessionData) {
    const token = sessionStorage.getItem('user');
    const response = await axios.put(`${base_url}/live-session/${sessionId}`, sessionData, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    return response;
}

export async function deleteLiveSession(sessionId) {
    const token = sessionStorage.getItem('user');
    const response = await axios.delete(`${base_url}/live-session/${sessionId}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return response;
}

console.log("Base URL:", base_url);