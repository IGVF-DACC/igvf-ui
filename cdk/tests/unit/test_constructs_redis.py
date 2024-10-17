import pytest

from aws_cdk.assertions import Template


def test_constructs_redis_initialize_redis_construct(stack, vpc, mocker, config, existing_resources):
    from infrastructure.constructs.redis import Redis
    from infrastructure.constructs.redis import RedisProps
    redis = Redis(
        stack,
        'Redis',
        props=RedisProps(
            config=config,
            existing_resources=existing_resources,
        )
    )
    template = Template.from_stack(stack)
    template.has_resource_properties(
        'AWS::EC2::SecurityGroup',
        {
            'GroupDescription': 'Security group for Redis cluster',
            'SecurityGroupEgress': [
                {
                    'CidrIp': '255.255.255.255/32',
                    'Description': 'Disallow all traffic',
                    'FromPort': 252,
                    'IpProtocol': 'icmp',
                    'ToPort': 86
                }
            ],
            'VpcId': {
                'Ref': 'TestVpcE77CE678'
            }
        }
    )
    template.has_resource_properties(
        'AWS::ElastiCache::SubnetGroup',
        {
            'Description': 'Subnet group for Redis cluster',
            'SubnetIds': [
                {
                    'Ref': 'TestVpcisolatedSubnet1Subnet2860A680'
                },
                {
                    'Ref': 'TestVpcisolatedSubnet2SubnetA6454F0B'
                }
            ]
        }
    )
    template.has_resource_properties(
        'AWS::ElastiCache::CacheCluster',
        {
            'CacheNodeType': 'cache.t4g.small',
            'CacheSubnetGroupName': {
                'Ref': 'RedisCfnSubnetGroup7F0F35B4'
            },
            'Engine': 'redis',
            'EngineVersion': '7.1',
            'NumCacheNodes': 1,
            'Tags': [
                {
                    'Key': 'branch',
                    'Value': 'some-branch'
                }
            ],
            'VpcSecurityGroupIds': [
                {
                    'Fn::GetAtt': [
                        'RedisSecurityGroupC1E9FD21',
                        'GroupId'
                    ]
                }
            ]
        }
    )
