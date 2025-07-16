import { useEffect, useRef, useState } from "react";

const VideoPopup = ({ src, alt, thumbnail, title }) => {

    const [popupOpen, setPopupOpen] = useState(false);
    const [thumbnailData, setThumbnailData] = useState(null);
    const thumbnailRef = useRef(null);
    const videoRef = useRef(null);

    const handleOpenPopup = () => {
        setPopupOpen(true);
    };

    const handleClosePopup = () => {
        setPopupOpen(false);
    };

    const getThumbnail = videoRef => {
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.width;
        canvas.height = videoRef.height;
        canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);

        const img = document.createElement('img');
        img.src = canvas.toDataURL();

        return img;
    }

    const handleOnLoadedData = () => {
        if(!thumbnailData)
            setThumbnailData(getThumbnail(videoRef.current));
    }

    useEffect(() => {
        if(thumbnail)
            setThumbnailData(thumbnail);
    }, [thumbnail]);

    return (
        <div className="video-popup">
            { popupOpen ? (
                <video src={src} alt={alt} controls title={title} ref={videoRef} onLoadedData={handleOnLoadedData}></video>
            ) : (
                <img src={thumbnailData} alt={alt} ref={thumbnailRef} className="experiment-video"/>
            ) }
        </div>
    )
}
 
export default VideoPopup;