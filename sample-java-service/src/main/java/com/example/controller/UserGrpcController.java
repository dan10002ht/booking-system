package com.example.controller;

import com.example.service.UserService;
import com.example.model.User;
import io.grpc.stub.StreamObserver;
import org.lognet.springboot.grpc.GRpcService;
import org.springframework.beans.factory.annotation.Autowired;
import user.UserServiceGrpc;
import user.UserOuterClass.GetUserRequest;
import user.UserOuterClass.GetUserResponse;

@GRpcService
public class UserGrpcController extends UserServiceGrpc.UserServiceImplBase {
    @Autowired
    private UserService userService;

    @Override
    public void getUser(GetUserRequest request, StreamObserver<GetUserResponse> responseObserver) {
        User user = userService.getUserById(request.getId());
        GetUserResponse response = GetUserResponse.newBuilder()
            .setId(user.getId())
            .setName(user.getName())
            .build();
        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }
} 