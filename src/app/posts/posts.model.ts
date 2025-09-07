export interface Post {
    id: string,
    title: string,
    content: string,
    imagePath: string | null,
    creator: string,
    likeCount: number,
    isLiked?: boolean
}

export enum LocalStorageEnum {
    userId = "userId",
    token = "token",
    expiration = "expiration",
    userName = "userName"
}