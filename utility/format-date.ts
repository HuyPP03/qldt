export const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    };
    return new Date(dateString).toLocaleDateString("vi-VN", options);
  };

export const convertToVietnameseTime = (isoDate: string) => {
    const date = new Date(isoDate);
  
    return date.toLocaleString('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',  
      year: 'numeric',    
      month: 'long',      
      day: 'numeric',    
      hour: 'numeric',    
      minute: 'numeric',  
      second: 'numeric',  
    });
  };